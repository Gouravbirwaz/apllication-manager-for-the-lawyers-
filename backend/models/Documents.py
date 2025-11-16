from extention import db
from datetime import datetime

class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"))
    title = db.Column(db.String(255), nullable=False)
    file_name = db.Column(db.String(255), nullable=False) # Original file name
    file_path = db.Column(db.String(500), nullable=False) # Path to where the file is stored (e.g., on a server, S3 bucket)
    document_type = db.Column(db.String(100), nullable=True) # e.g., Contract, Evidence, Pleading
    description = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    case = db.relationship("Case", backref="documents", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "title": self.title,
            "file_name": self.file_name,
            "file_path": self.file_path,
            "document_type": self.document_type,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
