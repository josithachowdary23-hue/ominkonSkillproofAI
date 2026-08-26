from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from video_processor import analyze_video_metadata


app = FastAPI(
    title="SkillProof AI API",
    description="Backend API for evidence-linked practical skill assessment.",
    version="0.4.0",
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


# Folder used to store uploaded learner videos.
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# Folder used to store timestamped evidence frames.
EVIDENCE_DIR = Path("evidence")
EVIDENCE_DIR.mkdir(
    parents=True,
    exist_ok=True
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
        "version": "0.4.0",
        "message": "Backend API is working",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/upload")
async def upload_video(
    video: UploadFile = File(...)
):
    # Validate MIME type.
    if video.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported video format. "
                "Please upload MP4, WebM, or MOV."
            ),
        )

    # Validate file extension.
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

    # Generate a unique SkillProof assessment ID.
    assessment_id = (
        f"SP-{uuid4().hex[:8].upper()}"
    )

    stored_filename = (
        f"{assessment_id}{extension}"
    )

    destination = (
        UPLOAD_DIR / stored_filename
    )

    # Save uploaded video.
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

    # Process video using OpenCV.
    try:
        video_metadata = analyze_video_metadata(
            destination,
            EVIDENCE_DIR,
            assessment_id
        )

    except ValueError as error:
        # Remove invalid video if processing fails.
        if destination.exists():
            destination.unlink()

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    return {
        "success": True,
        "assessment_id": assessment_id,
        "original_filename": video.filename,
        "stored_filename": stored_filename,
        "content_type": video.content_type,
        "processing_status": "evidence_frames_extracted",
        "video_metadata": video_metadata,
        "evidence_frame_count": len(
            video_metadata.get(
                "evidence_frames",
                []
            )
        ),
        "message": (
            "Video uploaded, processed, and "
            "timestamped evidence frames extracted successfully."
        ),
    }