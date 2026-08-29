import json
import sqlite3
from pathlib import Path
from typing import Optional


BASE_DIR = Path(__file__).resolve().parent

DATABASE_PATH = BASE_DIR / "skillproof.db"


def get_connection():
    """
    Create a connection to the local SkillProof SQLite database.
    """

    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    """
    Create the assessments table if it does not already exist.
    """

    connection = get_connection()

    try:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS assessments (
                assessment_id TEXT PRIMARY KEY,
                task_id TEXT NOT NULL,
                task_name TEXT NOT NULL,
                original_filename TEXT,
                processing_status TEXT NOT NULL,
                video_metadata TEXT,
                review_evidence TEXT,
                trainer_decisions TEXT,
                trainer_notes TEXT,
                final_status TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        connection.commit()

    finally:
        connection.close()


def create_assessment(
    assessment_id: str,
    task_id: str,
    task_name: str,
    original_filename: str,
    processing_status: str,
    video_metadata: dict,
    review_evidence: list,
):
    """
    Store a newly processed assessment.
    """

    connection = get_connection()

    try:
        connection.execute(
            """
            INSERT INTO assessments (
                assessment_id,
                task_id,
                task_name,
                original_filename,
                processing_status,
                video_metadata,
                review_evidence,
                trainer_decisions,
                trainer_notes,
                final_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                assessment_id,
                task_id,
                task_name,
                original_filename,
                processing_status,
                json.dumps(video_metadata),
                json.dumps(review_evidence),
                json.dumps({}),
                json.dumps({}),
                "trainer_review_pending",
            ),
        )

        connection.commit()

    finally:
        connection.close()


def get_assessment(
    assessment_id: str
) -> Optional[dict]:
    """
    Retrieve one assessment by ID.
    """

    connection = get_connection()

    try:
        row = connection.execute(
            """
            SELECT *
            FROM assessments
            WHERE assessment_id = ?
            """,
            (assessment_id,),
        ).fetchone()

    finally:
        connection.close()

    if row is None:
        return None

    return {
        "assessment_id":
            row["assessment_id"],

        "task_id":
            row["task_id"],

        "task":
            row["task_name"],

        "original_filename":
            row["original_filename"],

        "processing_status":
            row["processing_status"],

        "video_metadata":
            json.loads(
                row["video_metadata"] or "{}"
            ),

        "review_evidence":
            json.loads(
                row["review_evidence"] or "[]"
            ),

        "trainer_decisions":
            json.loads(
                row["trainer_decisions"] or "{}"
            ),

        "trainer_notes":
            json.loads(
                row["trainer_notes"] or "{}"
            ),

        "final_status":
            row["final_status"],

        "created_at":
            row["created_at"],

        "updated_at":
            row["updated_at"],
    }


def update_trainer_review(
    assessment_id: str,
    trainer_decisions: dict,
    trainer_notes: dict,
    final_status: str,
) -> bool:
    """
    Save trainer decisions and notes for an assessment.
    """

    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            UPDATE assessments
            SET
                trainer_decisions = ?,
                trainer_notes = ?,
                final_status = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE assessment_id = ?
            """,
            (
                json.dumps(
                    trainer_decisions
                ),
                json.dumps(
                    trainer_notes
                ),
                final_status,
                assessment_id,
            ),
        )

        connection.commit()

        return cursor.rowcount > 0

    finally:
        connection.close()