from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from dotenv import load_dotenv
from flask import url_for
import os

load_dotenv()

class UserDeatails(db.Model,UserMixin):
    __tablename__ = 'user_details'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80)) 
    email = db.Column(db.String(120), unique=True)
    password_hash = db.Column(db.String(256))
    phone_number = db.Column(db.String(15))
    photo_path = db.Column(db.String(255))
    photo_mime = db.Column(db.String(50))
    current_state = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active=db.Column(db.Boolean,default=False)
    total_case_handled=db.Column(db.Integer)
    role=db.Column(db.String(50))
    cases = db.relationship("Case", backref="advocate", lazy=True)
    gpay_upi_id=db.Column(db.String(50))
    def get_photo_url(self):
        """Generate public URL for the user's photo"""
        base_url = os.getenv("BASE_URL", "http://127.0.0.1:8080")
        if not self.photo_path:
            return None
        return f"{base_url}/users/{self.id}/photo"

    def to_dict(self, include_sensitive: bool = False):
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone_number": self.phone_number,
            "role":self.role,
            "current_state": self.current_state,
            "gpay_details":self.gpay_upi_id,
            "photo_url": self.get_photo_url(),
            "total_case_handled":self.total_case_handled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_sensitive:
            data["photo_mime"] = self.photo_mime
        return data
