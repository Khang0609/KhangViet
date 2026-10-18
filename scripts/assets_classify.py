import os
import shutil
from pathlib import Path
import sys

from PIL import Image
import cv2


# ============================================================
# CONFIGURATION
# ============================================================

ROOT_DIR = Path(sys.argv[1])

SQUARE_MIN = 0.95
SQUARE_MAX = 1.05

IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp",
    ".bmp", ".gif", ".tiff", ".tif"
}

VIDEO_EXTENSIONS = {
    ".mp4", ".avi", ".mkv", ".mov",
    ".wmv", ".flv", ".webm", ".m4v"
}

# These folders will be created inside ROOT_DIR.
OUTPUT_FOLDERS = {"image", "video", "other"}


# ============================================================
# CLASSIFICATION
# ============================================================

def classify_ratio(width, height):
    if height == 0:
        return "error"

    ratio = width / height

    if ratio < SQUARE_MIN:
        return "portrait"

    elif ratio > SQUARE_MAX:
        return "landscape"

    else:
        return "square"


# ============================================================
# IMAGE PROCESSING
# ============================================================

def process_image(path):
    try:
        with Image.open(path) as image:
            width, height = image.size

        return classify_ratio(width, height)

    except Exception as e:
        print(f"[ERROR][IMAGE] {path}")
        print(f"    {e}")
        return "error"


# ============================================================
# VIDEO PROCESSING
# ============================================================

def process_video(path):
    video = cv2.VideoCapture(str(path))

    if not video.isOpened():
        print(f"[ERROR][VIDEO] Cannot open: {path}")
        return "error"

    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

    video.release()

    if width == 0 or height == 0:
        print(f"[ERROR][VIDEO] Invalid dimensions: {path}")
        return "error"

    return classify_ratio(width, height)


# ============================================================
# GENERATE NEW FILE NAME
# ============================================================

def make_new_name(path):
    """
    Convert the original relative path into a flat filename.

    Example:

        Project_A/Final/photo.jpg

    becomes:

        Project_A_Final_photo.jpg
    """

    relative_path = path.relative_to(ROOT_DIR)

    parts = relative_path.parts

    # Remove the original filename
    folders = parts[:-1]
    filename = parts[-1]

    if folders:
        prefix = "_".join(folders)
        return f"{prefix}_{filename}"

    return filename


# ============================================================
# MOVE FILE
# ============================================================

def move_file(path, media_type, category):
    """
    Move a file into:

        ROOT_DIR/
        ├── image/
        │   ├── portrait/
        │   ├── square/
        │   └── landscape/
        │
        ├── video/
        │   ├── portrait/
        │   ├── square/
        │   └── landscape/
        │
        └── other/
    """

    if media_type == "image":
        destination_folder = ROOT_DIR / "image" / category

    elif media_type == "video":
        destination_folder = ROOT_DIR / "video" / category

    else:
        destination_folder = ROOT_DIR / "other"

    destination_folder.mkdir(parents=True, exist_ok=True)

    new_name = make_new_name(path)
    destination = destination_folder / new_name

    # Avoid overwriting an existing file
    counter = 1

    while destination.exists():
        stem = Path(new_name).stem
        suffix = Path(new_name).suffix

        new_name = f"{stem}_{counter}{suffix}"
        destination = destination_folder / new_name

        counter += 1

    shutil.move(str(path), str(destination))

    return destination


# ============================================================
# MAIN
# ============================================================

def main():

    statistics = {
        "image": {
            "portrait": 0,
            "square": 0,
            "landscape": 0,
            "error": 0
        },

        "video": {
            "portrait": 0,
            "square": 0,
            "landscape": 0,
            "error": 0
        },

        "other": 0
    }

    # Create the three top-level folders first.
    for folder in OUTPUT_FOLDERS:
        (ROOT_DIR / folder).mkdir(exist_ok=True)

    # os.walk is allowed to modify dirs in-place.
    for root, dirs, files in os.walk(ROOT_DIR):

        # Do not enter our output folders.
        dirs[:] = [
            directory
            for directory in dirs
            if directory not in OUTPUT_FOLDERS
        ]

        for filename in files:

            path = Path(root) / filename
            extension = path.suffix.lower()

            # -------------------------
            # IMAGE
            # -------------------------

            if extension in IMAGE_EXTENSIONS:

                category = process_image(path)

                if category == "error":
                    statistics["image"]["error"] += 1
                    continue

                statistics["image"][category] += 1

                new_path = move_file(
                    path,
                    "image",
                    category
                )

                print(
                    f"[IMAGE] {category:9} | "
                    f"{path} -> {new_path}"
                )

            # -------------------------
            # VIDEO
            # -------------------------

            elif extension in VIDEO_EXTENSIONS:

                category = process_video(path)

                if category == "error":
                    statistics["video"]["error"] += 1
                    continue

                statistics["video"][category] += 1

                new_path = move_file(
                    path,
                    "video",
                    category
                )

                print(
                    f"[VIDEO] {category:9} | "
                    f"{path} -> {new_path}"
                )

            # -------------------------
            # OTHER
            # -------------------------

            else:

                statistics["other"] += 1

                new_path = move_file(
                    path,
                    "other",
                    "other"
                )

                print(
                    f"[OTHER]            | "
                    f"{path} -> {new_path}"
                )

    # ========================================================
    # REMOVE EMPTY ORIGINAL DIRECTORIES
    # ========================================================

    for root, dirs, files in os.walk(
        ROOT_DIR,
        topdown=False
    ):

        for directory in dirs:

            path = Path(root) / directory

            if directory in OUTPUT_FOLDERS:
                continue

            try:
                path.rmdir()
            except OSError:
                # Directory is not empty.
                pass

    # ========================================================
    # SUMMARY
    # ========================================================

    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)

    print("\nImages:")
    for category, count in statistics["image"].items():
        print(f"  {category:10}: {count}")

    print("\nVideos:")
    for category, count in statistics["video"].items():
        print(f"  {category:10}: {count}")

    print(f"\nOther files: {statistics['other']}")


if __name__ == "__main__":
    main()