# SkillProof AI

### AI-Assisted Evidence-Linked Practical Skill Assessment

SkillProof AI is an AI-assisted platform designed to make practical 
vocational skill assessment more structured, consistent and evidence-based.

## Problem

Practical vocational skills are often evaluated through manual observation, 
making assessment time-consuming and potentially inconsistent. Final scores 
may also provide limited evidence of which specific steps or competencies 
were demonstrated.

## Proposed Solution

SkillProof AI allows a learner to record a predefined practical task using 
a smartphone. Computer vision analyzes the video to identify observable 
movements and actions.

The observations are mapped to a task-specific competency rubric and 
converted into timestamped evidence with confidence levels. A trainer 
reviews the flagged moments and confirms or overrides the AI observations.

The verified assessment is stored as a structured digital skill record.

## MVP Task

Correct Handwashing Procedure

The MVP focuses on one predefined practical task.

## How It Works

Learner records task
→ Video upload
→ CV-assisted observation
→ Rubric matching
→ Timestamped evidence + confidence
→ Trainer verification
→ Verified skill record

## Prototype Status

### Implemented
- Task definition
- Task-specific competency rubric
- Learner assessment interface
- Video upload
- FastAPI backend
- CV-assisted video processing
- Evidence generation
- Trainer verification dashboard
- Verified assessment record

### In Progress
- Rubric evidence matching
- CV observation accuracy

> Note: The above reflects the target MVP scope.
> Items will be updated as each component is completed.

## Project Structure

skillproof-ai/
├── frontend/         React UI
├── backend/          Python + FastAPI
├── data/             Rubric + sample videos
├── docs/             Architecture + task definitions
└── README.md

## Technology Stack

- Frontend: React + Vite
- Backend: Python + FastAPI
- Computer Vision: MediaPipe + OpenCV
- Storage: JSON / SQLite (MVP)
- Deployment: Cloud-ready

## Team

- Jositha Chowdary
- Sindhuja Sai

## Hackathon

**OMNIKON National Hackathon 2026**
**Problem ID:** Omni_EdTech_3
**Theme:** EdTech & Skill Development
