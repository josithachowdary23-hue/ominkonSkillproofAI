from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from evidence_engine import create_review_evidence, load_rubric
from video_processor import analyze_video_metadata


BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent

UPLOAD_DIR = BASE_DIR / "uploads"
EVIDENCE_DIR = BASE_DIR / "evidence"
RUBRIC_PATH = PROJECT_ROOT / "data" / "sample_rubric.json"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

EVIDENCE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


app = FastAPI(
    title="SkillProof AI API",
    description=(
        "Backend API for evidence-linked "
        "practical skill assessment."
    ),
    version="0.5.0",
)


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


ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
}


@app.get("/")
def root():
    return {
        "app": "SkillProof AI",
        "status": "running",
        "version": "0.5.0",
        "message": "Backend API is working",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.get("/rubric")
def get_rubric():
    try:
        return load_rubric(
            RUBRIC_PATH
        )

    except (
        ValueError,
        OSError
    ) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@app.post("/upload")
async def upload_video(
    video: UploadFile = File(...)
):
    if video.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Please upload MP4, WebM, or MOV."
            ),
        )

    extension = Path(
        video.filename or "video.mp4"
    ).suffix.lower()

    if extension not in {
        ".mp4",
        ".webm",
        ".mov"
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid video file extension.",
        )

    assessment_id = (
        f"SP-{uuid4().hex[:8].upper()}"
    )

    stored_filename = (
        f"{assessment_id}{extension}"
    )

    destination = (
        UPLOAD_DIR / stored_filename
    )

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

    try:
        video_metadata = analyze_video_metadata(
            destination,
            EVIDENCE_DIR,
            assessment_id
        )

        rubric = load_rubric(
            RUBRIC_PATH
        )

        review_evidence = create_review_evidence(
            rubric,
            video_metadata.get(
                "evidence_frames",
                []
            )
        )

    except (
        ValueError,
        OSError
    ) as error:

        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

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

        "message": (
            "Video processed and candidate evidence "
            "prepared for trainer review."
        ),
    }