Of course ma — here it is in a **single clean copy-paste block**, with the Markdown formatting preserved:

````markdown
# SkillProof AI — MVP System Architecture

## Current Implemented Flow

Learner  
↓  
React Learner Interface  
↓  
Video Selection + Preview  
↓  
FastAPI Upload API  
↓  
Video Validation + Assessment ID  
↓  
OpenCV Video Processing  
↓  
Visual Activity Detection  
↓  
Timestamped Candidate Evidence Frames  
↓  
Evidence Engine  
↓  
Task-Specific JSON Competency Rubric  
↓  
Trainer Verification Dashboard  
↓  
Confirm / Override  
↓  
Verified Assessment Record

---

## 1. Learner Interface

Built using React and Vite.

Current functionality:

- Displays the selected practical task
- Displays competency criteria
- Allows video selection
- Shows video preview
- Sends video to FastAPI
- Displays processing results

---

## 2. FastAPI Backend

The Python FastAPI backend handles:

- Video upload
- Video-format validation
- Assessment ID generation
- Local prototype file storage
- OpenCV processing
- Rubric loading
- Evidence-response generation

Main backend file:

`backend/main.py`

---

## 3. Video Processing

Implemented using OpenCV.

Current processing includes:

- FPS extraction
- Frame count
- Video duration
- Resolution
- Frame sampling
- Visual-change measurement
- High-activity moment selection
- Timestamped frame extraction

Implementation:

`backend/video_processor.py`

---

## 4. Computer Vision Evidence

The current MVP uses visual activity detection.

Frame-to-frame visual changes are measured to identify candidate moments that may contain useful practical-task evidence.

Example:

E1 → 00:01  
E2 → 00:05  
E3 → 00:07  
E4 → 00:09  
E5 → 00:14

Each candidate contains:

- Evidence ID
- Timestamp
- Activity score
- Extracted frame
- Trainer-review-required status

### Important Limitation

Visual activity detection does not independently determine which practical competency was successfully demonstrated.

Candidate moments are therefore treated as review assistance rather than automatic certification.

---

## 5. Digital Competency Rubric

The MVP rubric is stored in:

`data/sample_rubric.json`

Current task:

**Basic Package Preparation and Sealing Procedure**

Criteria:

- C1 — Package Preparation
- C2 — Item Preparation
- C3 — Item Placement
- C4 — Package Closure
- C5 — Package Sealing

---

## 6. Evidence Engine

Implementation:

`backend/evidence_engine.py`

The Evidence Engine:

- Loads the task-specific JSON rubric
- Receives CV-generated candidate moments
- Creates structured trainer-review records
- Associates available candidate evidence with competency review
- Marks final interpretation as requiring human verification

---

## 7. Trainer Verification

The React Trainer Verification Dashboard provides:

- Rubric criteria
- Candidate evidence timestamps
- Confirm button
- Override button
- Review progress
- Criterion-level trainer decisions

Core safeguard:

**AI FLAGS → HUMAN VERIFIES**

---

## 8. Verified Assessment Record

After all competency criteria are reviewed, the frontend generates a structured assessment record containing:

- Assessment ID
- Task
- Task ID
- Criterion-level decisions
- Confirmed count
- Overridden count
- Trainer-review-complete status

---

# Current MVP Architecture

```text
┌──────────────────────┐
│   Learner / Trainer  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     React + Vite     │
│      Frontend        │
└──────────┬───────────┘
           │ Video
           ▼
┌──────────────────────┐
│       FastAPI        │
│       Backend        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       OpenCV         │
│   Video Processing   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Visual Activity      │
│ Detection            │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Timestamped          │
│ Candidate Evidence   │
└──────────┬───────────┘
           │
           ├──────────────┐
           ▼              ▼
┌──────────────────┐  ┌─────────────────┐
│ Evidence Engine  │  │ JSON Rubric     │
└────────┬─────────┘  └────────┬────────┘
         │                      │
         └──────────┬───────────┘
                    ▼
          ┌────────────────────┐
          │ Trainer Dashboard  │
          └─────────┬──────────┘
                    │
              Confirm / Override
                    │
                    ▼
          ┌────────────────────┐
          │ Verified           │
          │ Assessment Record  │
          └────────────────────┘
```

---

# Current Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Uvicorn

### Computer Vision

- OpenCV
- NumPy

### Data

- JSON competency rubric
- Controlled sample videos
- Generated timestamped evidence frames

---

# Planned Architecture Improvements

Future stages may add:

- Persistent database storage
- PostgreSQL
- Cloud video storage
- Task-specific action recognition
- Procedure sequence analysis
- Improved evidence-to-rubric mapping
- Authentication
- Trainer / learner accounts
- Multi-task support
- Digital Skill Passports
````
