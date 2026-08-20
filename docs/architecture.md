# SkillProof AI — System Architecture

## Overall Flow

Learner
↓
Video Capture
↓
Video Processing
↓
Computer Vision
↓
Task-Specific Rubric
↓
Evidence + Confidence + Timestamp
↓
Trainer Dashboard
↓
Confirm / Override
↓
Verified Skill Record

## Main Components

### 1. Learner Interface
Allows the learner to select a task and record the practical activity.

### 2. Video Processing
Receives and processes the recorded video.

### 3. Computer Vision Layer
Extracts observable information such as:
- Human pose
- Tool presence
- Observable actions
- Safety cues

### 4. Competency Rubric
Defines the criteria that must be demonstrated for the selected task.

### 5. Evidence Engine
Links observations to specific rubric criteria and timestamps.

### 6. Trainer Dashboard
Allows the trainer to review flagged evidence and confirm or override AI observations.

### 7. Digital Skill Record
Stores the final verified assessment outcome.
