from extention import db
from datetime import datetime

class Case(db.Model):
    __tablename__ = 'cases'

    id = db.Column(db.Integer, primary_key=True)
    case_title = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default='open')
    case_type = db.Column(db.String(100), nullable=False)
    

    client_id = db.Column(db.Integer, db.ForeignKey('clients.id'), nullable=False)
    
    client = db.relationship('Client', backref='cases', lazy=True)

    next_hearing = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    advocate_id = db.Column(db.Integer, db.ForeignKey("user_details.id"), nullable=True)
    documents = db.relationship('Document', backref='case', lazy=True, cascade='all, delete')
    def to_dict(self):
        return {
            "id": self.id,
            "case_title": self.case_title,
            "status": self.status,
             "advocate_id":self.advocate_id,
            "case_type": self.case_type,
            "client": self.client.to_dict() if self.client else None,
            "next_hearing": self.next_hearing,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    

    



class Document(db.Model):
    __tablename__ = 'documents'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    path = db.Column(db.String(255), nullable=False)
    case_id = db.Column(db.Integer, db.ForeignKey('cases.id'), nullable=False)