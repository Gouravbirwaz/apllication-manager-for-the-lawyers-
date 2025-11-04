from extention import db
from datetime import datetime

class Hearing(db.Model):
    __tablename__ = "hearings"

    id = db.Column(db.Integer, primary_key=True)
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id")) # Table name for Case model
    hearing_date = db.Column(db.DateTime, nullable=False)
    court = db.Column(db.String(255), nullable=True)
    judge = db.Column(db.String(255), nullable=True)
    details = db.Column(db.Text, nullable=True)
    next_hearing_date = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship to the Case model
    case = db.relationship("Case", backref="hearings", lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "case_id": self.case_id,
            "hearing_date": self.hearing_date.isoformat() if self.hearing_date else None,
            "court": self.court,
            "judge": self.judge,
            "details": self.details,
            "next_hearing_date": self.next_hearing_date.isoformat() if self.next_hearing_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
