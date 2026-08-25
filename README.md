# SkillProof AI

## AI-Assisted Evidence-Linked Practical Skill Assessment

SkillProof AI is an AI-assisted platform designed to make practical vocational skill assessment more structured, consistent, and evidence-based.

Instead of giving only a final score, SkillProof AI links observable moments from a learner's practical-task video to predefined competency criteria. A trainer then reviews the AI-generated evidence and makes the final assessment decision.

---

## Problem Statement

Practical vocational skills are often assessed through direct manual observation.

This creates several challenges:

- Assessment can depend heavily on individual evaluator judgment.
- Trainers may need to watch complete practical performances.
- Final scores often contain limited evidence showing what the learner actually demonstrated.
- Maintaining consistency across multiple learners and training centres can be difficult.
- Scaling practical assessment increases evaluator workload.

SkillProof AI aims to support trainers with structured, evidence-linked observations rather than replacing them.

---

## Proposed Solution

SkillProof AI allows a learner to perform and record a predefined practical task using a smartphone camera.

The recorded video is processed using computer vision to identify relevant observable information.

The system then:

1. Processes the learner's practical-task video.
2. Extracts observable evidence from relevant moments.
3. Maps observations to a task-specific competency rubric.
4. Generates timestamps and confidence information.
5. Flags evidence for trainer review.
6. Allows the trainer to confirm or override AI observations.
7. Generates a trainer-verified assessment record.

### Core Principle

**AI flags. Human verifies.**

SkillProof AI assists the assessor with evidence. It does not independently certify learner competency.

---

## MVP Practical Task

### Basic Package Preparation and Sealing Procedure

The hackathon MVP focuses on one predefined practical task:

**Basic Package Preparation and Sealing Procedure**

This task was selected because it provides a simple, observable, multi-step practical workflow that can be recorded using a standard smartphone without specialized equipment.

### Required Materials

The controlled MVP demonstration requires:

- A small cardboard box or similar package
- One small safe object to package
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

The learner's performance is recorded and submitted to SkillProof AI for analysis.

---

## MVP Competency Rubric

The practical task currently contains five competency criteria.

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

The machine-readable rubric is stored in:

`data/sample_rubric.json`

---

## How SkillProof AI Works

```text
Learner Selects Practical Task
            ↓
Learner Records / Uploads Video
            ↓
Video Processing
            ↓
Computer-Vision-Assisted Observation
            ↓
Task-Specific Rubric Matching
            ↓
Evidence + Timestamp + Confidence
            ↓
Trainer Dashboard
            ↓
Trainer Reviews Flagged Evidence
            ↓
Confirm / Override
            ↓
Verified Assessment Record
```

---

## Example Evidence

Instead of returning only:

```text
Student Score: 8/10
```

SkillProof AI aims to provide evidence such as:

```text
Criterion: C3 — Item Placement

Observation:
Item placement evidence detected.

Timestamp:
00:14

Confidence:
87%

AI Status:
Detected

Trainer Decision:
Pending Review
```

The trainer can navigate to the relevant moment in the video and either confirm or override the observation.

---

## Key Features

The target MVP includes:

- Task-specific practical assessment
- Video upload
- Computer-vision-assisted video analysis
- Digital competency rubric
- Evidence-linked assessment
- Video timestamps
- Confidence information
- Trainer review
- Confirm / Override workflow
- Verified assessment record

---

## Prototype Status

### Completed

- Problem definition
- Proposed solution
- MVP scope definition
- Practical task selection
- Package preparation task definition
- Task-specific competency rubric
- Sample video testing strategy
- Initial system architecture
- Project documentation
- Frontend and backend project folders

### In Development

- React learner interface
- Video upload workflow
- FastAPI backend
- Video processing pipeline
- Computer vision observations
- Rubric-to-evidence mapping
- Timestamped evidence generation
- Trainer verification dashboard
- Confirm / Override functionality
- Verified assessment record

The implementation status will be updated as development progresses.

---

## Planned MVP Demo

The Round 2 / Round 3 prototype is designed around one complete vertical workflow.

```text
SELECT TASK
Basic Package Preparation and Sealing Procedure
        ↓
UPLOAD VIDEO
Learner uploads recorded performance
        ↓
PROCESS VIDEO
Backend receives and processes the video
        ↓
OBSERVE
Computer vision extracts relevant observable information
        ↓
MATCH
Observations are compared with the digital task rubric
        ↓
GENERATE EVIDENCE
Criterion + Timestamp + Confidence + Status
        ↓
TRAINER REVIEW
Trainer views relevant evidence
        ↓
CONFIRM / OVERRIDE
Human assessor makes the final decision
        ↓
VERIFIED ASSESSMENT
Structured assessment result is generated
```

---

## Sample Video Testing Strategy

The initial MVP will use controlled sample videos recorded by the team.

### Video 1 — Correct Procedure

The learner performs all predefined packaging steps in the expected sequence.

**Expected outcome:**

All applicable criteria should have supporting evidence available for trainer review.

### Video 2 — Missing Sealing Step

The learner prepares the package, places the item inside, and closes the package but does not seal it.

**Expected outcome:**

C5 — Package Sealing should be identified as missing or flagged for trainer review.

### Video 3 — Changed / Incomplete Procedure

The learner skips or changes one of the predefined steps.

**Expected outcome:**

The affected criterion should be identified for trainer review where supported by the prototype's observation capabilities.

---

## Technical Architecture

The planned MVP architecture is:

```text
React Frontend
      ↓
FastAPI Backend
      ↓
Video Upload
      ↓
Video Processing
      ↓
Computer Vision Layer
      ↓
Observable Evidence
      ↓
JSON Competency Rubric
      ↓
Evidence Mapping
      ↓
Timestamp + Confidence + Status
      ↓
Trainer Dashboard
      ↓
Confirm / Override
      ↓
Verified Assessment Record
```

---

## Technology Stack

### Frontend

- React
- Vite
- HTML
- CSS
- JavaScript

### Backend

- Python
- FastAPI

### Video / Computer Vision

- OpenCV
- Suitable pretrained computer vision components based on MVP testing

### MVP Data

- JSON competency rubric
- Controlled team-recorded sample videos
- Lightweight/local prototype storage

### Future Production Architecture

Potential future components include:

- PostgreSQL
- Cloud object storage
- Asynchronous video processing
- Secure user authentication
- Role-based access control

---

## Project Structure

```text
ominkonSkillproofAI/
│
├── frontend/
│   └── React learner and trainer interface
│
├── backend/
│   └── FastAPI and video analysis pipeline
│
├── data/
│   └── sample_rubric.json
│
├── docs/
│   ├── architecture.md
│   ├── mvp_task.md
│   └── sample_video_plan.md
│
└── README.md
```

---

## Why Human Verification Matters

Computer vision can make incorrect observations because of factors such as:

- Poor lighting
- Camera angle
- Object occlusion
- Background clutter
- Different packaging materials
- Different ways of performing the same action

Therefore, SkillProof AI does not treat an AI observation as the final assessment decision.

The workflow remains:

```text
AI Observation
      ↓
Evidence Flag
      ↓
Trainer Review
      ↓
Human Decision
```

This keeps the trainer in control of the assessment.

---

## Current MVP Limitations

The current prototype is intentionally limited.

It focuses on:

- One practical task
- Controlled recording conditions
- Short sample videos
- A predefined competency rubric
- Basic observable evidence
- Human verification

The MVP is intended to demonstrate the feasibility of the evidence-linked assessment workflow rather than claim general-purpose recognition of all vocational skills.

---

## Challenges Being Addressed

### Camera and Lighting Variation

Different recording conditions can affect computer vision observations.

**Approach:** Use controlled recording conditions during the MVP and later introduce recording guidance.

### Limited Task-Specific Data

Large task-specific training datasets are not currently available.

**Approach:** Begin with controlled team-recorded videos and pretrained computer vision components.

### AI Misclassification

Computer vision observations may be incorrect.

**Approach:** Display confidence information and require trainer verification.

### Action Recognition

Some practical actions are more difficult to distinguish than simple object presence.

**Approach:** Keep the MVP task narrow and gradually improve temporal/action recognition.

### Video Processing

Video files require more processing than individual images.

**Approach:** Use frame extraction and lightweight processing during the MVP.

---

## Future Roadmap

After validating the core prototype, SkillProof AI can be expanded in stages.

### Stage 1 — MVP

- One predefined practical task
- Video upload
- Basic CV-assisted analysis
- Digital rubric
- Timestamped evidence
- Trainer verification

### Stage 2 — Improved Assessment

- Better action recognition
- Sequence analysis
- Improved confidence calculation
- Persistent assessment history
- Improved trainer dashboard

### Stage 3 — Multiple Vocational Tasks

The rubric-based architecture can be extended to other tasks within areas such as:

- Logistics
- Manufacturing
- Electrical trades
- Workshop practices
- Technical training

### Stage 4 — Institutional Platform

Potential future capabilities include:

- Learner accounts
- Trainer accounts
- Training-centre dashboards
- Assessment history
- Analytics
- Secure evidence storage

### Stage 5 — Digital Skill Passport

Trainer-verified assessments could contribute to structured digital skill records that provide evidence of demonstrated practical competencies.

---

## Vision

SkillProof AI is designed around a simple idea:

**Practical skill assessment should show evidence, not just a score.**

The long-term goal is to help trainers evaluate practical skills using structured, traceable, and reviewable evidence while keeping humans responsible for the final assessment decision.

---

## Team

### Team SkillForge

- Jositha Chowdary
- Sindhuja Sai

---

## Hackathon

**OMNIKON National Hackathon 2026**

**Problem ID:** Omni_EdTech_3

**Theme:** EdTech & Skill Development

**Project:** SkillProof AI

