# SkillProof AI

## AI-Assisted Evidence-Linked Practical Skill Assessment

SkillProof AI is an AI-assisted platform designed to make practical vocational skill assessment more structured, traceable, and evidence-based.

Instead of returning only a final score, SkillProof AI processes a learner's practical-task video, identifies candidate moments of visual activity, links those moments to a predefined competency rubric for review, and allows a trainer to make the final assessment decision.

> **Core Principle: AI flags. Human verifies.**

SkillProof AI assists the assessor with evidence. It does not independently certify learner competency.

---

## Problem Statement

Practical vocational skills are often assessed through direct manual observation.

This creates several challenges:

- Assessment can depend heavily on individual evaluator judgment.
- Trainers may need to review complete practical performances.
- Final scores often provide limited supporting evidence.
- Maintaining consistency across learners and training centres can be difficult.
- Scaling practical assessment increases evaluator workload.

SkillProof AI explores an evidence-first assessment workflow where computer vision helps trainers identify relevant moments without removing the human assessor from the decision-making process.

---

## Proposed Solution

A learner records a predefined practical task using a smartphone camera and uploads the performance video to SkillProof AI.

The current prototype:

1. Receives the learner's practical-task video.
2. Processes the video using OpenCV.
3. Measures visual activity across the performance.
4. Identifies high-activity candidate moments.
5. Extracts timestamped evidence frames.
6. Loads a task-specific digital competency rubric.
7. Makes candidate moments available for rubric-based trainer review.
8. Allows the trainer to confirm or override each criterion.
9. Generates a trainer-reviewed assessment record.

---

# MVP Practical Task

## Basic Package Preparation and Sealing Procedure

The hackathon MVP focuses on one controlled practical task:

**Basic Package Preparation and Sealing Procedure**

This task provides a simple, observable, multi-step workflow that can be recorded using a standard smartphone without specialized equipment.

### Required Materials

- Small cardboard box or similar package
- One small safe object
- Tape
- Smartphone camera

---

## Expected Procedure

The learner performs the following predefined procedure:

1. Prepare the package or box.
2. Prepare the item for packaging.
3. Place the item inside the package.
4. Close the package.
5. Apply sealing material to complete the package.

---

# MVP Competency Rubric

The prototype currently uses five predefined criteria:

### C1 — Package Preparation

The learner prepares the package or box before placing the item.

### C2 — Item Preparation

The learner has the item ready for packaging.

### C3 — Item Placement

The learner places the item inside the package.

### C4 — Package Closure

The learner closes the package after placing the item.

### C5 — Package Sealing

The learner applies sealing material to complete the package.

The machine-readable rubric is stored at:

`data/sample_rubric.json`

---

# Current Prototype Workflow

```text
Learner Selects Task
        ↓
Uploads Performance Video
        ↓
FastAPI Receives Video
        ↓
OpenCV Video Processing
        ↓
Visual Activity Analysis
        ↓
High-Activity Candidate Moments
        ↓
Timestamped Evidence Frames
        ↓
Task-Specific JSON Rubric
        ↓
Rubric-Linked Review Queue
        ↓
Trainer Verification Dashboard
        ↓
Confirm / Override
        ↓
Verified Assessment Record
```

---

# Features Implemented

## Learner Interface

- Practical task information
- Task competency rubric
- Video selection and upload
- Video preview
- Performance analysis workflow
- Processing status and assessment ID

## Backend API

- Python + FastAPI backend
- Video upload endpoint
- Video-format validation
- Unique assessment ID generation
- Local prototype video storage
- CORS integration with React
- Health and rubric endpoints
- Swagger/OpenAPI documentation

## Video Processing

- OpenCV-based video processing
- FPS extraction
- Frame-count extraction
- Video-duration calculation
- Resolution extraction
- Frame sampling
- Visual activity measurement
- High-activity moment selection
- Timestamped evidence-frame extraction

## Evidence Engine

- Task-specific JSON rubric
- Rubric loading through the backend
- Structured candidate-evidence records
- Timestamp-linked review candidates
- Trainer-review-required status

## Trainer Verification

- Trainer Verification Dashboard
- Candidate timestamp display
- Confirm decision
- Override decision
- Review progress tracking
- Human-in-the-loop workflow

## Verified Assessment Record

- Assessment ID
- Task information
- Criterion-level trainer decisions
- Confirmed/overridden summary
- Final trainer-review status
- Human-verification safeguard

---

# Current Computer Vision Approach

The current MVP uses:

**OpenCV Visual Activity Detection**

The system analyzes changes between sampled video frames and identifies moments with relatively high visual activity.

For example:

```text
E1 → Timestamp 00:01 → Activity Score
E2 → Timestamp 00:05 → Activity Score
E3 → Timestamp 00:07 → Activity Score
E4 → Timestamp 00:09 → Activity Score
E5 → Timestamp 00:14 → Activity Score
```

These moments are provided to the trainer as **candidate evidence**.

An activity score represents measured visual change in the video. It is not treated as a probability that a competency was successfully demonstrated.

---

# Human-in-the-Loop Safeguard

The current prototype deliberately does not treat computer-vision output as final certification.

```text
Computer Vision
      ↓
Candidate Evidence
      ↓
Rubric Review
      ↓
Trainer
      ↓
Confirm / Override
      ↓
Verified Assessment Record
```

The trainer remains responsible for the final assessment decision.

---

# Important MVP Limitation

The current OpenCV activity detector identifies moments of visual activity.

It does **not yet semantically recognize each packaging action** such as:

- "The item was correctly placed"
- "The package was correctly closed"
- "The sealing step was successfully completed"

Therefore, candidate CV moments are made available for trainer review instead of being automatically treated as proof of individual competencies.

Advanced action and sequence recognition is part of the future roadmap.

---

# Example Prototype Output

```text
Assessment ID: SP-XXXXXXXX

CV Candidate Evidence
E1 → 00:01
E2 → 00:05
E3 → 00:07
E4 → 00:09
E5 → 00:14

Trainer Review

C1 — Package Preparation
Decision: CONFIRMED

C2 — Item Preparation
Decision: CONFIRMED

C3 — Item Placement
Decision: CONFIRMED

C4 — Package Closure
Decision: OVERRIDDEN

C5 — Package Sealing
Decision: CONFIRMED

Final Status:
TRAINER REVIEW COMPLETE
```

---

# Technical Architecture

```text
React Frontend
      ↓
FastAPI Backend
      ↓
Video Upload
      ↓
OpenCV Processing
      ↓
Visual Activity Detection
      ↓
Timestamped Evidence Frames
      ↓
Evidence Engine
      +
JSON Competency Rubric
      ↓
Trainer Verification Dashboard
      ↓
Confirm / Override
      ↓
Verified Assessment Record
```

---

# Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

## Backend

- Python
- FastAPI
- Uvicorn

## Computer Vision

- OpenCV
- NumPy

Pretrained object-detection approaches were explored during development. The current MVP uses OpenCV activity detection because generic object detection alone does not reliably represent task-specific procedural actions.

## Data

- JSON competency rubric
- Controlled team-recorded packaging video
- Locally generated timestamped evidence frames

---

# Project Structure

```text
ominkonSkillproofAI/
│
├── backend/
│   ├── main.py
│   ├── video_processor.py
│   ├── evidence_engine.py
│   ├── requirements.txt
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── data/
│   └── sample_rubric.json
│
├── docs/
│   ├── architecture.md
│   ├── mvp_task.md
│   └── sample_video_plan.md
│
├── .gitignore
└── README.md
```

Generated videos and evidence images are intentionally excluded from the public Git repository.

---

# Prototype Status

## Implemented

- MVP practical task
- Digital competency rubric
- Learner assessment UI
- Video selection and preview
- React-to-FastAPI integration
- Video upload
- Video validation
- Unique assessment IDs
- OpenCV video processing
- Visual activity detection
- Timestamped candidate evidence
- Evidence frame extraction
- Rubric loading
- Evidence-review structure
- Trainer dashboard
- Confirm / Override workflow
- Review progress
- Verified assessment record

## Partially Implemented

- Rubric-to-evidence mapping

The current system presents CV-generated candidate moments against the rubric for human review. Automatic semantic mapping of a detected action to a specific competency is not yet implemented.

## Planned

- Task-specific action recognition
- Procedure sequence detection
- Improved evidence confidence model
- Persistent assessment storage
- Persistent trainer decisions
- Database integration
- User authentication
- Multi-task support
- Deployment
- Digital Skill Passport

---

# Current Storage Limitation

The prototype currently uses local storage and frontend state for the demonstration workflow.

Trainer decisions are currently maintained during the active frontend session and are not yet persisted to a production database.

Persistent assessment storage is planned for the next prototype stage.

---

# Testing Strategy

The MVP uses controlled team-recorded videos.

Testing focuses on:

- Successful video upload
- Valid video processing
- Metadata extraction
- Activity detection
- Candidate timestamp generation
- Evidence-frame extraction
- Rubric loading
- Trainer Confirm / Override workflow
- Final assessment-record generation

Controlled recording conditions include:

- Stationary smartphone camera
- Clear view of the workspace
- Good lighting
- Visible package and learner actions
- Short practical-task video

---

# Challenges Faced

## Task-Specific Action Recognition

Generic pretrained object detection does not automatically understand procedural packaging actions.

**Current approach:** Use OpenCV to identify candidate activity moments and keep the trainer responsible for semantic interpretation.

## Limited Task-Specific Dataset

A large labelled packaging-action dataset is not currently available.

**Current approach:** Validate the complete workflow using controlled team-recorded sample videos.

## Camera Variation

Motion and visual-change measurements can vary with camera movement.

**Current approach:** Use a stationary-camera setup for the MVP.

## AI Misclassification

Automatic observations can be incorrect.

**Current approach:** Candidate evidence is never treated as final certification without trainer review.

---

# Future Roadmap

## Next Prototype Stage

- Persistent assessment records
- Save trainer Confirm / Override decisions
- Improved evidence selection
- Better evidence-to-criterion mapping
- Action and sequence recognition
- Improved UI navigation between video timestamps

## Expansion Stage

- Additional packaging/logistics tasks
- Multiple vocational domains
- Task-specific CV models
- Trainer and learner accounts
- Institute dashboards
- Assessment analytics

## Long-Term Vision

Trainer-verified practical assessments could contribute to a structured **Digital Skill Passport** containing evidence of demonstrated practical competencies.

---

# Why SkillProof AI?

Traditional assessment often ends with:

```text
Student Score: 8/10
```

SkillProof AI aims to support outcomes such as:

```text
Criterion: Package Closure
Candidate Evidence: 00:09
Source: CV-identified activity moment
Trainer Decision: CONFIRMED / OVERRIDDEN
```

The goal is not to replace the assessor.

The goal is to give the assessor better evidence.

---

# Vision

**Practical skill assessment should show evidence, not just a score.**

SkillProof AI explores how computer vision, structured competency rubrics, and human verification can work together to create more traceable practical-skill assessment.

---

# Team

## Team SkillForge

- Jositha Chowdary
- Sindhuja Sai

---

# Hackathon

**OMNIKON National Hackathon 2026**

**Problem ID:** Omni_EdTech_3

**Theme:** EdTech & Skill Development

**Project:** SkillProof AI