from extention import db
from datetime import datetime, date

class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id")) # Table name for Client model
    case_id = db.Column(db.Integer, db.ForeignKey("cases.id"), nullable=True) # An invoice might be for a client generally or a specific case
    invoice_number = db.Column(db.String(100), unique=True, nullable=False)
    issue_date = db.Column(db.Date, default=date.today, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(50), default="Pending") # e.g., Pending, Paid, Overdue, Cancelled
    description = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    client = db.relationship("Client", backref="invoices", lazy=True)
    case = db.relationship("Case", backref="invoices_for_case", lazy=True) # Use a distinct backref name for case relationship
    # payments backref is handled by payment_model.py

    def to_dict(self):
        return {
            "id": self.id,
            "client_id": self.client_id,
            "case_id": self.case_id,
            "invoice_number": self.invoice_number,
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "total_amount": float(self.total_amount),
            "status": self.status,
            "description": self.description,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
