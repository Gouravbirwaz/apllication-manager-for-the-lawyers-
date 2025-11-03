from flask import Blueprint, request, jsonify
from extention import db
from models import Payment
from datetime import datetime

payment_bp = Blueprint("payment_bp", __name__)

# -------------------- CREATE --------------------
@payment_bp.route("/payments", methods=["POST"])
def create_payment():
    data = request.get_json()

    required_fields = ["advocate_id", "status"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"'{field}' is required"}), 400

    new_payment = Payment(
        advocate_id=data["advocate_id"],
        status=data["status"],
        cases=data.get("cases", 0),
        billable_hours=data.get("billable_hours", 0.0),
        amount=data.get("amount", 0.0),
        transaction_status=data.get("transaction_status", False),
    )

    db.session.add(new_payment)
    db.session.commit()

    return jsonify({"message": "Payment created successfully", "payment": new_payment.to_dit()}), 201


# -------------------- READ ALL --------------------
@payment_bp.route("/payments", methods=["GET"])
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([p.to_dit() for p in payments]), 200


# -------------------- READ ONE --------------------
@payment_bp.route("/payments/<int:id>", methods=["GET"])
def get_payment(id):
    payment = Payment.query.get_or_404(id)
    return jsonify(payment.to_dit()), 200


# -------------------- UPDATE (PATCH) --------------------
@payment_bp.route("/payments/<int:id>", methods=["PATCH"])
def update_payment(id):
    data = request.get_json()
    payment = Payment.query.get_or_404(id)

    allowed_fields = ["status", "cases", "billable_hours", "amount", "transaction_status", "advocate_id"]
    for field in allowed_fields:
        if field in data:
            setattr(payment, field, data[field])

    db.session.commit()

    return jsonify({"message": "Payment updated successfully", "payment": payment.to_dit()}), 200


# -------------------- DELETE --------------------
@payment_bp.route("/payments/<int:id>", methods=["DELETE"])
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()

    return jsonify({"message": f"Payment record with ID {id} deleted successfully"}), 200
