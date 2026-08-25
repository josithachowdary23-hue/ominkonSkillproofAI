from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="SkillProof AI API",
    description="Backend API for evidence-linked practical skill assessment.",
    version="0.2.0",
)


# Allow the local React frontend to communicate with FastAPI.
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


UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

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
        "message": "Backend API is working",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


@app.post("/upload")
async def upload_video(video: UploadFile = File(...)):
    if video.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format. Please upload MP4, WebM, or MOV.",
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

    return {
        "success": True,
        "assessment_id": assessment_id,
        "original_filename": video.filename,
        "stored_filename": stored_filename,
        "content_type": video.content_type,
        "message": "Video uploaded successfully. Analysis has not started yet.",
    }