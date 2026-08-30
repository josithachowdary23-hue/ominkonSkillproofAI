import json
from pathlib import Path


def load_rubric(
    rubric_path: Path
) -> dict:
    """
    Load a task-specific competency rubric.
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
    Map chronological candidate evidence to
    chronological procedural criteria.

    IMPORTANT:
    This is a transparent temporal heuristic.

    It does not claim semantic action recognition.
    The trainer must verify every suggestion.
    """

    criteria = rubric.get(
        "criteria",
        []
    )

    sorted_frames = sorted(
        evidence_frames,
        key=lambda frame:
            frame.get(
                "timestamp_seconds",
                0
            )
    )

    review_items = []

    total_criteria = len(
        criteria
    )

    total_frames = len(
        sorted_frames
    )

    for index, criterion in enumerate(
        criteria
    ):
        primary_evidence = None

        if total_frames > 0:
            if total_criteria <= 1:
                frame_index = 0
            else:
                position = (
                    index
                    / (total_criteria - 1)
                )

                frame_index = round(
                    position
                    * (total_frames - 1)
                )

            frame_index = min(
                frame_index,
                total_frames - 1
            )

            primary_evidence = (
                sorted_frames[
                    frame_index
                ]
            )

        if primary_evidence:
            suggested_evidence = {
                "evidence_id":
                    primary_evidence.get(
                        "evidence_id"
                    ),

                "timestamp":
                    primary_evidence.get(
                        "timestamp"
                    ),

                "timestamp_seconds":
                    primary_evidence.get(
                        "timestamp_seconds"
                    ),

                "activity_score":
                    primary_evidence.get(
                        "activity_score"
                    ),

                "filename":
                    primary_evidence.get(
                        "filename"
                    ),

                "mapping_method":
                    "temporal_procedure_mapping"
            }

            ai_status = (
                "temporal_candidate_suggested"
            )

        else:
            suggested_evidence = None

            ai_status = (
                "no_candidate_evidence"
            )

        review_items.append(
            {
                "criterion_id":
                    criterion.get("id"),

                "criterion_name":
                    criterion.get("name"),

                "criterion_description":
                    criterion.get(
                        "description"
                    ),

                "expected_order":
                    index + 1,

                "ai_status":
                    ai_status,

                "mapping_method":
                    "temporal_procedure_mapping",

                "suggested_evidence":
                    suggested_evidence,

                "candidate_evidence":
                    (
                        [suggested_evidence]
                        if suggested_evidence
                        else []
                    ),

                "trainer_decision":
                    "pending",

                "verification_required":
                    True
            }
        )

    return review_items


def analyze_sequence(
    review_evidence: list
) -> dict:
    """
    Check whether suggested procedural evidence
    follows the expected chronological order.
    """

    observed_steps = []

    for item in review_evidence:
        evidence = item.get(
            "suggested_evidence"
        )

        if not evidence:
            continue

        observed_steps.append(
            {
                "criterion_id":
                    item.get(
                        "criterion_id"
                    ),

                "expected_order":
                    item.get(
                        "expected_order"
                    ),

                "timestamp_seconds":
                    evidence.get(
                        "timestamp_seconds"
                    ),

                "timestamp":
                    evidence.get(
                        "timestamp"
                    )
            }
        )

    ordered_steps = sorted(
        observed_steps,
        key=lambda item:
            item["timestamp_seconds"]
    )

    observed_order = [
        item["criterion_id"]
        for item in ordered_steps
    ]

    expected_order = [
        item["criterion_id"]
        for item in sorted(
            observed_steps,
            key=lambda item:
                item["expected_order"]
        )
    ]

    sequence_matches = (
        observed_order
        == expected_order
    )

    return {
        "method":
            "timestamp_order_validation",

        "expected_order":
            expected_order,

        "observed_order":
            observed_order,

        "sequence_status":
            (
                "expected_order_observed"
                if sequence_matches
                else "sequence_review_required"
            ),

        "verification_required":
            True,

        "note": (
            "Sequence result is based on "
            "temporally mapped candidate evidence "
            "and requires trainer verification."
        )
    }