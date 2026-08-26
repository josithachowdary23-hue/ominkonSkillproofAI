from pathlib import Path

import cv2


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
    Read an uploaded video with OpenCV, calculate real metadata,
    and extract timestamped frames for later evidence analysis.
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

    sample_percentages = [
        0.1,
        0.3,
        0.5,
        0.7,
        0.9
    ]

    evidence_frames = []

    for index, percentage in enumerate(
        sample_percentages,
        start=1
    ):
        timestamp_seconds = duration_seconds * percentage

        capture.set(
            cv2.CAP_PROP_POS_MSEC,
            timestamp_seconds * 1000
        )

        success, frame = capture.read()

        if not success:
            continue

        frame_filename = (
            f"{assessment_id}_frame_{index}.jpg"
        )

        frame_path = evidence_dir / frame_filename

        saved = cv2.imwrite(
            str(frame_path),
            frame
        )

        if not saved:
            continue

        evidence_frames.append(
            {
                "frame_id": f"F{index}",
                "timestamp_seconds": round(
                    timestamp_seconds,
                    2
                ),
                "timestamp": format_timestamp(
                    timestamp_seconds
                ),
                "filename": frame_filename
            }
        )

    capture.release()

    return {
        "fps": round(fps, 2),
        "frame_count": frame_count,
        "duration_seconds": round(
            duration_seconds,
            2
        ),
        "resolution": {
            "width": width,
            "height": height
        },
        "sample_timestamps": [
            frame["timestamp_seconds"]
            for frame in evidence_frames
        ],
        "evidence_frames": evidence_frames
    }