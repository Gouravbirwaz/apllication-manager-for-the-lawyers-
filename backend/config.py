# config.py
import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads", "profile_photos")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

class Config:
    UPLOAD_FOLDER = UPLOAD_FOLDER
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = 'gouravpoojary2005@gmail.com'
    MAIL_PASSWORD = 'sxkw ogka wjwk vvtp'
