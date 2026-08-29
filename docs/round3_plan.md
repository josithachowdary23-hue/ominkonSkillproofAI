# SkillProof AI — Round 3 Implementation Plan

## Goal

Convert the Round 2 functional MVP into a persistent, deployable, judge-ready working prototype.

## Round 2 Baseline

The current prototype supports:

- Practical-task video upload
- FastAPI backend processing
- OpenCV visual activity detection
- Timestamped candidate evidence
- JSON competency rubric
- Rubric-linked review queue
- Trainer Confirm / Override
- Verified assessment record

## Round 3 Priorities

### 1. Persistent Assessments
Store assessments, evidence metadata and trainer decisions so results survive page refreshes.

### 2. Evidence Viewer
Display extracted evidence frames and allow trainers to inspect candidate moments directly.

### 3. Better Evidence Mapping
Improve how candidate evidence is suggested for individual competency criteria.

### 4. Sequence Analysis
Introduce task-step ordering and flag possible sequence issues.

### 5. Trainer Dashboard 2.0
Add clickable timestamps, evidence viewing, trainer notes and persistent verification.

### 6. Verified Record 2.0
Create persistent structured assessment records.

### 7. Scalability
Reduce hardcoded task logic and make the workflow driven by configurable task rubrics.

### 8. Deployment
Deploy the frontend and backend so judges can access the working prototype through a public link.

### 9. Code Quality
Refactor, document and test the codebase.

### 10. Final Validation
Test the prototype with multiple controlled videos and document observed results.

## Round 3 Target Flow

Learner selects task
→ uploads performance video
→ backend processes video
→ CV extracts candidate evidence
→ evidence is linked to assessment criteria
→ trainer reviews evidence
→ trainer confirms or overrides
→ decisions are saved
→ verified assessment is generated
→ assessment can be reopened later

## Technical Principle

AI/CV provides assessment assistance.

The trainer remains responsible for the final competency decision.

**AI FLAGS. HUMAN VERIFIES.**