from extention import db




class Payment(db.Model):
    __tablename__ = 'payment'

    id = db.Column(db.Integer, primary_key=True)
    advocate_id = db.Column(db.Integer, db.ForeignKey('user_details.id'), nullable=False)
    status = db.Column(db.String(50), nullable=False)
    cases = db.Column(db.Integer, default=0)
    billable_hours = db.Column(db.Float, default=0.0)
    amount = db.Column(db.Float, default=0.0)
    transaction_status=db.Column(db.Boolean,default=False)
    
    def to_dit(self):
        return {
            "id":self.id,
            "advocate_id":self.advocate_id,
            "status":self.status,
            "billable_hours" :self.billable_hours,
            "amount":self.amount,
            "transaction_status":self.transaction_status           
        }