from fastapi import FastAPI

app = FastAPI(
    title="SkillProof AI API",
    description="Backend API for evidence-linked practical skill assessment.",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "app": "SkillProof AI",
        "status": "running",
        "message": "Backend API is working"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }