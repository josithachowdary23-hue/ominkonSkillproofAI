import json
from pathlib import Path


def load_rubric(rubric_path: Path) -> dict:
    """
    Load the task-specific competency rubric.
    """

    if not rubric_path.exists():
        raise ValueError(
            "Rubric file could not be found."
        )

    with rubric_path.open(
        "r",
        encoding="utf-8"
    ) as file:
        return json.load(file)


def create_review_evidence(
    rubric: dict,
    evidence_frames: list
) -> list:
    """
    Create trainer-review records.

    Activity-based CV evidence identifies moments of
    visual activity but does not independently prove
    that a competency criterion was completed.

    Candidate evidence is therefore presented to the
    trainer for human verification.
    """

    review_items = []

    criteria = rubric.get(
        "criteria",
        []
    )

    for criterion in criteria:
        candidate_frames = []

        for frame in evidence_frames:
            candidate_frames.append(
                {
                    "evidence_id":
                        frame["evidence_id"],
                    "timestamp":
                        frame["timestamp"],
                    "timestamp_seconds":
                        frame["timestamp_seconds"],
                    "activity_score":
                        frame["activity_score"],
                    "filename":
                        frame["filename"]
                }
            )

        review_items.append(
            {
                "criterion_id":
                    criterion["id"],
                "criterion_name":
                    criterion["name"],
                "criterion_description":
                    criterion["description"],

                "ai_status":
                    "candidate_evidence_available"
                    if candidate_frames
                    else "no_candidate_evidence",

                "candidate_evidence":
                    candidate_frames,

                "trainer_decision":
                    "pending",

                "verification_required":
                    True
            }
        )

    return review_items