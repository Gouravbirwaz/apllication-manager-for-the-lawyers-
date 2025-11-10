from extention import db
from datetime import datetime, date

class Task(db.Model):
    __tablename__ = "tasks"

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"))
    assigned_to_id = db.Column(db.Integer, db.ForeignKey("users.id")) # Table name for User model
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default="Pending") # e.g., Pending, In Progress, Completed
    priority = db.Column(db.String(50), default="Medium") # e.g., Low, Medium, High

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    case = db.relationship("Case", backref="tasks", lazy=True)
    assigned_to_user = db.relationship("User", backref="tasks", lazy=True) # Class name for User model

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "assigned_to_id": self.assigned_to_id,
            "title": self.title,
            "description": self.description,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
