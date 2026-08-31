from pathlib import Path
from uuid import uuid4
import os

from fastapi import FastAPI, File, HTTPException, UploadFile, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from database import (
    create_assessment,
    get_assessment,
    initialize_database,
    update_trainer_review,
)
from evidence_engine import (
    analyze_sequence,
    create_review_evidence,
    load_rubric,
)
from video_processor import analyze_video_metadata


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

UPLOAD_DIR = BASE_DIR / "uploads"
EVIDENCE_DIR = BASE_DIR / "evidence"
RUBRIC_PATH = PROJECT_ROOT / "data" / "sample_rubric.json"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)


app = FastAPI(
    title="SkillProof AI API",
    description="Persistent evidence-linked practical skill assessment API.",
    version="1.2.1",
)

initialize_database()


def _normalize_origin(origin: str) -> str:
    return (origin or "").strip().rstrip("/")


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "")
    raw = raw.strip()

    # allow all
    if raw == "*":
        return ["*"]

    if raw:
        return [
            _normalize_origin(o)
            for o in raw.split(",")
            if _normalize_origin(o)
        ]

    # Local dev fallback (Vite default)
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


def get_cors_origin_regex() -> str | None:
    """
    Safety net so Render Static Site domains work even if CORS_ORIGINS
    isn't set correctly.

    Override in Render env if you want:
      CORS_ORIGIN_REGEX=DISABLE
    or set your own regex.
    """
    raw = os.getenv("CORS_ORIGIN_REGEX", r"^https://.*\.onrender\.com$")
    raw = (raw or "").strip()

    if raw.lower() in {"", "none", "false", "disable"}:
        return None

    return raw


CORS_ORIGINS = get_cors_origins()
CORS_ORIGIN_REGEX = get_cors_origin_regex()

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Debug endpoint (helps confirm what the backend thinks CORS is)
@app.get("/debug/cors")
def debug_cors(request: Request):
    return {
        "Origin_header": request.headers.get("origin"),
        "CORS_ORIGINS_env": os.getenv("CORS_ORIGINS"),
        "CORS_ORIGIN_REGEX_env": os.getenv("CORS_ORIGIN_REGEX"),
        "effective_allow_origins": CORS_ORIGINS,
        "effective_allow_origin_regex": CORS_ORIGIN_REGEX,
    }


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

VALID_DECISIONS = {
    "confirmed",
    "overridden",
}


class TrainerReviewRequest(BaseModel):
    trainer_decisions: dict[str, str]
    trainer_notes: dict[str, str] = Field(default_factory=dict)


def add_runtime_urls(assessment: dict) -> dict:
    original_filename = assessment.get("original_filename") or ""

    extension = Path(original_filename).suffix.lower()

    if extension not in {".mp4", ".webm", ".mov"}:
        extension = ".mp4"

    stored_filename = f"{assessment['assessment_id']}{extension}"

    assessment["stored_filename"] = stored_filename
    assessment["video_url"] = f"/videos/{stored_filename}"

    metadata = assessment.get("video_metadata", {})

    for frame in metadata.get("evidence_frames", []):
        filename = frame.get("filename")

        if filename:
            frame["image_url"] = f"/evidence/{filename}"

    assessment["sequence_analysis"] = metadata.get("sequence_analysis")

    return assessment


# Allow HEAD too (helps some platforms health-check with HEAD /)
@app.api_route("/", methods=["GET", "HEAD"])
def root():
    return {
        "app": "SkillProof AI",
        "status": "running",
        "version": "1.2.1",
        "database": "sqlite",
        "evidence_mapping": "temporal_procedure_mapping",
        "sequence_analysis": "timestamp_order_validation",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite",
        "persistent_reviews": True,
        "evidence_serving": True,
        "video_serving": True,
        "sequence_analysis": True,
    }


@app.get("/rubric")
def get_rubric():
    try:
        return load_rubric(RUBRIC_PATH)
    except (ValueError, OSError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.get("/assessments/{assessment_id}")
def read_assessment(assessment_id: str):
    assessment = get_assessment(assessment_id)

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    return add_runtime_urls(assessment)


@app.put("/assessments/{assessment_id}/review")
def save_trainer_review(
    assessment_id: str,
    review: TrainerReviewRequest,
):
    assessment = get_assessment(assessment_id)

    if assessment is None:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found.",
        )

    for criterion_id, decision in review.trainer_decisions.items():
        if criterion_id not in VALID_CRITERIA:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown criterion: {criterion_id}",
            )

        if decision not in VALID_DECISIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Invalid decision for {criterion_id}. "
                    "Use confirmed or overridden."
                ),
            )

    for criterion_id in review.trainer_notes:
        if criterion_id not in VALID_CRITERIA:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown note criterion: {criterion_id}",
            )

    reviewed_count = len(review.trainer_decisions)

    if reviewed_count == len(VALID_CRITERIA):
        final_status = "trainer_review_complete"
    elif reviewed_count > 0:
        final_status = "trainer_review_in_progress"
    else:
        final_status = "trainer_review_pending"

    updated = update_trainer_review(
        assessment_id=assessment_id,
        trainer_decisions=review.trainer_decisions,
        trainer_notes=review.trainer_notes,
        final_status=final_status,
    )

    if not updated:
        raise HTTPException(
            status_code=500,
            detail="Trainer review could not be saved.",
        )

    saved = get_assessment(assessment_id)

    return {
        "success": True,
        "message": "Trainer review saved.",
        "reviewed_count": reviewed_count,
        "total_criteria": len(VALID_CRITERIA),
        "final_status": final_status,
        "assessment": add_runtime_urls(saved),
    }


@app.post("/upload")
async def upload_video(video: UploadFile = File(...)):
    if video.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Please upload MP4, WebM, or MOV.",
        )

    extension = Path(video.filename or "video.mp4").suffix.lower()

    if extension not in {".mp4", ".webm", ".mov"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid video file extension.",
        )

    assessment_id = f"SP-{uuid4().hex[:8].upper()}"
    stored_filename = f"{assessment_id}{extension}"
    destination = UPLOAD_DIR / stored_filename

    try:
        with destination.open("wb") as output_file:
            while chunk := await video.read(1024 * 1024):
                output_file.write(chunk)
    finally:
        await video.close()

    try:
        video_metadata = analyze_video_metadata(
            destination,
            EVIDENCE_DIR,
            assessment_id,
        )

        rubric = load_rubric(RUBRIC_PATH)

        review_evidence = create_review_evidence(
            rubric,
            video_metadata.get("evidence_frames", []),
        )

        sequence_analysis = analyze_sequence(review_evidence)

        video_metadata["sequence_analysis"] = sequence_analysis

        for frame in video_metadata.get("evidence_frames", []):
            filename = frame.get("filename")

            if filename:
                frame["image_url"] = f"/evidence/{filename}"

        create_assessment(
            assessment_id=assessment_id,
            task_id=rubric.get("task_id"),
            task_name=rubric.get("task"),
            original_filename=video.filename,
            processing_status="trainer_review_ready",
            video_metadata=video_metadata,
            review_evidence=review_evidence,
        )

    except (ValueError, OSError) as error:
        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "success": True,
        "assessment_id": assessment_id,
        "task_id": rubric.get("task_id"),
        "task": rubric.get("task"),
        "original_filename": video.filename,
        "stored_filename": stored_filename,
        "video_url": f"/videos/{stored_filename}",
        "content_type": video.content_type,
        "processing_status": "trainer_review_ready",
        "analysis_method": video_metadata.get("analysis_method"),
        "evidence_mapping_method": "temporal_procedure_mapping",
        "video_metadata": video_metadata,
        "review_evidence": review_evidence,
        "sequence_analysis": sequence_analysis,
        "trainer_decisions": {},
        "trainer_notes": {},
        "final_status": "trainer_review_pending",
    }


# Mount static directories LAST so API routes are registered first.
app.mount(
    "/evidence",
    StaticFiles(directory=EVIDENCE_DIR),
    name="evidence",
)

app.mount(
    "/videos",
    StaticFiles(directory=UPLOAD_DIR),
    name="videos",
)