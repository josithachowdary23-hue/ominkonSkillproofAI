from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import (
    create_assessment,
    get_assessment,
    initialize_database,
    update_trainer_review,
)
from evidence_engine import (
    create_review_evidence,
    load_rubric,
)
from video_processor import analyze_video_metadata


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

UPLOAD_DIR = BASE_DIR / "uploads"
EVIDENCE_DIR = BASE_DIR / "evidence"

RUBRIC_PATH = (
    PROJECT_ROOT
    / "data"
    / "sample_rubric.json"
)


UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

EVIDENCE_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# --------------------------------------------------
# FASTAPI
# --------------------------------------------------

app = FastAPI(
    title="SkillProof AI API",
    description=(
        "Backend API for evidence-linked "
        "practical skill assessment."
    ),
    version="1.0.0",
)


# Initialize SQLite when backend starts.
initialize_database()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# CONFIGURATION
# --------------------------------------------------

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
}


VALID_CRITERIA = {
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
}


VALID_TRAINER_DECISIONS = {
    "confirmed",
    "overridden",
}


# --------------------------------------------------
# REQUEST MODELS
# --------------------------------------------------

class TrainerReviewRequest(BaseModel):
    """
    Data submitted by the trainer.

    Example:

    {
        "trainer_decisions": {
            "C1": "confirmed",
            "C2": "confirmed",
            "C3": "confirmed",
            "C4": "overridden",
            "C5": "confirmed"
        },
        "trainer_notes": {
            "C4": "Closure needs improvement."
        }
    }
    """

    trainer_decisions: dict[str, str]

    trainer_notes: dict[str, str] = Field(
        default_factory=dict
    )


# --------------------------------------------------
# BASIC API ROUTES
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "app": "SkillProof AI",
        "status": "running",
        "version": "1.0.0",
        "message": (
            "SkillProof AI backend is running."
        ),
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite",
    }


# --------------------------------------------------
# RUBRIC
# --------------------------------------------------

@app.get("/rubric")
def get_rubric():
    """
    Return the configured MVP competency rubric.
    """

    try:
        return load_rubric(
            RUBRIC_PATH
        )

    except (
        ValueError,
        OSError,
    ) as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# --------------------------------------------------
# ASSESSMENT RETRIEVAL
# --------------------------------------------------

@app.get(
    "/assessments/{assessment_id}"
)
def read_assessment(
    assessment_id: str,
):
    """
    Retrieve an existing assessment
    from SQLite.
    """

    assessment = get_assessment(
        assessment_id
    )

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    return assessment


# --------------------------------------------------
# TRAINER REVIEW
# --------------------------------------------------

@app.put(
    "/assessments/{assessment_id}/review"
)
def save_trainer_review(
    assessment_id: str,
    review: TrainerReviewRequest,
):
    """
    Persist trainer Confirm / Override decisions
    and optional criterion notes.
    """

    existing_assessment = get_assessment(
        assessment_id
    )

    if existing_assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    # Validate trainer decisions.
    for criterion_id, decision in (
        review.trainer_decisions.items()
    ):

        if criterion_id not in VALID_CRITERIA:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unknown criterion: "
                    f"{criterion_id}"
                ),
            )

        if (
            decision
            not in VALID_TRAINER_DECISIONS
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid decision for "
                    f"{criterion_id}. "
                    f"Use 'confirmed' or "
                    f"'overridden'."
                ),
            )

    # Validate trainer-note criterion IDs.
    for criterion_id in (
        review.trainer_notes.keys()
    ):

        if criterion_id not in VALID_CRITERIA:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unknown note criterion: "
                    f"{criterion_id}"
                ),
            )

    reviewed_count = len(
        review.trainer_decisions
    )

    # Determine review status.
    if (
        reviewed_count
        == len(VALID_CRITERIA)
    ):
        final_status = (
            "trainer_review_complete"
        )

    elif reviewed_count > 0:
        final_status = (
            "trainer_review_in_progress"
        )

    else:
        final_status = (
            "trainer_review_pending"
        )

    # Save to SQLite.
    updated = update_trainer_review(
        assessment_id=assessment_id,
        trainer_decisions=(
            review.trainer_decisions
        ),
        trainer_notes=(
            review.trainer_notes
        ),
        final_status=final_status,
    )

    if not updated:
        raise HTTPException(
            status_code=500,
            detail=(
                "Trainer review could not "
                "be saved."
            ),
        )

    saved_assessment = get_assessment(
        assessment_id
    )

    return {
        "success": True,

        "message":
            "Trainer review saved.",

        "reviewed_count":
            reviewed_count,

        "total_criteria":
            len(VALID_CRITERIA),

        "final_status":
            final_status,

        "assessment":
            saved_assessment,
    }


# --------------------------------------------------
# VIDEO UPLOAD + PROCESSING
# --------------------------------------------------

@app.post("/upload")
async def upload_video(
    video: UploadFile = File(...),
):
    """
    Upload and process a learner
    practical-task video.

    Pipeline:

    Video
    → OpenCV
    → Candidate Evidence
    → Rubric
    → Evidence Engine
    → SQLite Assessment
    """

    # Validate MIME type.
    if (
        video.content_type
        not in ALLOWED_VIDEO_TYPES
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Please upload MP4, WebM, "
                "or MOV."
            ),
        )

    # Validate extension.
    extension = Path(
        video.filename or "video.mp4"
    ).suffix.lower()

    if extension not in {
        ".mp4",
        ".webm",
        ".mov",
    }:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid video file extension."
            ),
        )

    # Generate unique SkillProof assessment ID.
    assessment_id = (
        f"SP-{uuid4().hex[:8].upper()}"
    )

    stored_filename = (
        f"{assessment_id}{extension}"
    )

    destination = (
        UPLOAD_DIR / stored_filename
    )

    # --------------------------------------------------
    # SAVE VIDEO
    # --------------------------------------------------

    try:

        with destination.open(
            "wb"
        ) as output_file:

            while chunk := await video.read(
                1024 * 1024
            ):
                output_file.write(chunk)

    finally:

        await video.close()


    # --------------------------------------------------
    # PROCESS VIDEO
    # --------------------------------------------------

    try:

        video_metadata = (
            analyze_video_metadata(
                destination,
                EVIDENCE_DIR,
                assessment_id,
            )
        )

        rubric = load_rubric(
            RUBRIC_PATH
        )

        review_evidence = (
            create_review_evidence(
                rubric,
                video_metadata.get(
                    "evidence_frames",
                    [],
                ),
            )
        )

        # Persist assessment.
        create_assessment(
            assessment_id=assessment_id,

            task_id=rubric.get(
                "task_id"
            ),

            task_name=rubric.get(
                "task"
            ),

            original_filename=(
                video.filename
            ),

            processing_status=(
                "trainer_review_ready"
            ),

            video_metadata=(
                video_metadata
            ),

            review_evidence=(
                review_evidence
            ),
        )

    except (
        ValueError,
        OSError,
    ) as error:

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


    # --------------------------------------------------
    # RESPONSE
    # --------------------------------------------------

    return {
        "success": True,

        "assessment_id":
            assessment_id,

        "task_id":
            rubric.get("task_id"),

        "task":
            rubric.get("task"),

        "original_filename":
            video.filename,

        "stored_filename":
            stored_filename,

        "content_type":
            video.content_type,

        "processing_status":
            "trainer_review_ready",

        "analysis_method":
            video_metadata.get(
                "analysis_method"
            ),

        "video_metadata":
            video_metadata,

        "review_evidence":
            review_evidence,

        "trainer_decisions": {},

        "trainer_notes": {},

        "final_status":
            "trainer_review_pending",

        "message": (
            "Video processed, candidate "
            "evidence prepared, and "
            "assessment saved."
        ),
    }