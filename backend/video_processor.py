from pathlib import Path

import cv2
import numpy as np


def format_timestamp(seconds: float) -> str:
    minutes = int(seconds // 60)
    remaining_seconds = int(seconds % 60)
    return f"{minutes:02d}:{remaining_seconds:02d}"


def analyze_video_metadata(
    video_path: Path,
    evidence_dir: Path,
    assessment_id: str
) -> dict:
    """
    Process an uploaded video using OpenCV.

    The MVP:
    - extracts real video metadata
    - measures visual change over time
    - identifies high-activity candidate moments
    - saves timestamped evidence frames

    Activity moments are candidates for trainer review.
    They are not treated as automatic proof of a rubric criterion.
    """

    capture = cv2.VideoCapture(str(video_path))

    if not capture.isOpened():
        raise ValueError(
            "OpenCV could not open the uploaded video."
        )

    fps = capture.get(cv2.CAP_PROP_FPS)
    frame_count = int(
        capture.get(cv2.CAP_PROP_FRAME_COUNT)
    )
    width = int(
        capture.get(cv2.CAP_PROP_FRAME_WIDTH)
    )
    height = int(
        capture.get(cv2.CAP_PROP_FRAME_HEIGHT)
    )

    if fps <= 0:
        capture.release()
        raise ValueError(
            "Could not determine video FPS."
        )

    duration_seconds = frame_count / fps

    evidence_dir.mkdir(
        parents=True,
        exist_ok=True
    )

    # Analyze approximately two frames per second.
    sample_interval = max(
        int(fps / 2),
        1
    )

    previous_gray = None
    activity_samples = []

    frame_index = 0

    while True:
        success, frame = capture.read()

        if not success:
            break

        if frame_index % sample_interval == 0:
            resized = cv2.resize(
                frame,
                (320, 180)
            )

            gray = cv2.cvtColor(
                resized,
                cv2.COLOR_BGR2GRAY
            )

            gray = cv2.GaussianBlur(
                gray,
                (5, 5),
                0
            )

            if previous_gray is not None:
                difference = cv2.absdiff(
                    previous_gray,
                    gray
                )

                activity_score = float(
                    np.mean(difference)
                )

                timestamp_seconds = (
                    frame_index / fps
                )

                activity_samples.append(
                    {
                        "timestamp_seconds":
                            round(timestamp_seconds, 2),
                        "activity_score":
                            round(activity_score, 2)
                    }
                )

            previous_gray = gray

        frame_index += 1

    capture.release()

    # Rank moments by measured visual activity.
    ranked_samples = sorted(
        activity_samples,
        key=lambda item: item["activity_score"],
        reverse=True
    )

    selected_moments = []

    # Keep moments separated so we don't select
    # several frames from the same movement.
    minimum_gap_seconds = 2.0

    for sample in ranked_samples:
        timestamp = sample[
            "timestamp_seconds"
        ]

        too_close = any(
            abs(
                timestamp -
                selected["timestamp_seconds"]
            ) < minimum_gap_seconds
            for selected in selected_moments
        )

        if not too_close:
            selected_moments.append(sample)

        if len(selected_moments) == 5:
            break

    # Put selected moments back into chronological order.
    selected_moments.sort(
        key=lambda item:
            item["timestamp_seconds"]
    )

    evidence_frames = []

    # Reopen video for exact evidence-frame extraction.
    capture = cv2.VideoCapture(
        str(video_path)
    )

    for index, moment in enumerate(
        selected_moments,
        start=1
    ):
        timestamp_seconds = moment[
            "timestamp_seconds"
        ]

        capture.set(
            cv2.CAP_PROP_POS_MSEC,
            timestamp_seconds * 1000
        )

        success, frame = capture.read()

        if not success:
            continue

        frame_filename = (
            f"{assessment_id}_activity_{index}.jpg"
        )

        frame_path = (
            evidence_dir / frame_filename
        )

        saved = cv2.imwrite(
            str(frame_path),
            frame
        )

        if not saved:
            continue

        evidence_frames.append(
            {
                "evidence_id": f"E{index}",
                "timestamp":
                    format_timestamp(
                        timestamp_seconds
                    ),
                "timestamp_seconds":
                    timestamp_seconds,
                "activity_score":
                    moment["activity_score"],
                "filename":
                    frame_filename,
                "type":
                    "high_activity_candidate",
                "review_status":
                    "trainer_review_required"
            }
        )

    capture.release()

    return {
        "fps": round(fps, 2),
        "frame_count": frame_count,
        "duration_seconds":
            round(duration_seconds, 2),
        "resolution": {
            "width": width,
            "height": height
        },
        "analysis_method":
            "opencv_visual_activity_detection",
        "evidence_frames":
            evidence_frames
    }