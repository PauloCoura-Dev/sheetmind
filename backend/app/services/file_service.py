import os
import uuid

from app.config import settings


def save_upload_file(contents: bytes, user_id: str, ext: str) -> str:
    """Save file to disk. Returns stored_filename (UUID + ext)."""
    user_dir = os.path.join(settings.UPLOAD_DIR, user_id)
    os.makedirs(user_dir, exist_ok=True)

    stored_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(user_dir, stored_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    return stored_filename


def delete_upload_file(user_id: str, stored_filename: str) -> None:
    """Delete a file from disk. Silently ignores missing files."""
    file_path = os.path.join(settings.UPLOAD_DIR, user_id, stored_filename)
    if os.path.exists(file_path):
        os.remove(file_path)


def get_file_path(user_id: str, stored_filename: str) -> str:
    return os.path.join(settings.UPLOAD_DIR, user_id, stored_filename)
