from extention import db
from datetime import datetime

class TimeEntry(db.Model):
    __tablename__ = "time_entries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id")) # Table name for User model
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"))
    start_time = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False) # Consider calculating this in application logic
    description = db.Column(db.Text, nullable=True)
    billable = db.Column(db.Boolean, default=True)
    rate_per_hour = db.Column(db.Numeric(10, 2), nullable=True) # Could be set by user or case

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = db.relationship("User", backref="time_entries", lazy=True)
    case = db.relationship("Case", backref="time_entries", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "case_id": self.case_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "duration_minutes": self.duration_minutes,
            "description": self.description,
            "billable": self.billable,
            "rate_per_hour": float(self.rate_per_hour) if self.rate_per_hour else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
