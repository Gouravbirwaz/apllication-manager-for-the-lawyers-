from flask import Blueprint, request, jsonify,render_template
from extention import db,mail
from flask_mail import Message
from models import Payment,Invoice
from datetime import datetime,date

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

    return jsonify({"message": "Payment created successfully", "payment": new_payment.to_dict()}), 201


# -------------------- READ ALL --------------------
@payment_bp.route("/payments", methods=["GET"])
def get_all_payments():
    payments = Payment.query.all()
    return jsonify([p.to_dict() for p in payments]), 200


# -------------------- READ ONE --------------------
@payment_bp.route("/payments/<int:id>", methods=["GET"])
def get_payment(id):
    payment = Payment.query.get_or_404(id)
    return jsonify(payment.to_dict()), 200


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

    return jsonify({"message": "Payment updated successfully", "payment": payment.to_dict()}), 200


# -------------------- DELETE --------------------
@payment_bp.route("/payments/<int:id>", methods=["DELETE"])
def delete_payment(id):
    payment = Payment.query.get_or_404(id)
    db.session.delete(payment)
    db.session.commit()

    return jsonify({"message": f"Payment record with ID {id} deleted successfully"}), 200



@payment_bp.route('/invoices', methods=['POST'])
def create_invoice():
    try:
        data = request.get_json()

        invoice = Invoice(
            client_id=data.get('client_id'),
            case_id=data.get('case_id'),
            invoice_number=data.get('invoice_number'),
            issue_date=datetime.strptime(data.get('issue_date'), "%Y-%m-%d").date() if data.get('issue_date') else date.today(),
            due_date=datetime.strptime(data.get('due_date'), "%Y-%m-%d").date(),
            total_amount=data.get('total_amount'),
            status=data.get('status', "Pending"),
            description=data.get('description')
        )

        db.session.add(invoice)
        db.session.commit()
        return jsonify({"message": "Invoice created successfully", "invoice": invoice.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ---------------------------
# READ all invoices
# ---------------------------
@payment_bp.route('/invoices', methods=['GET'])
def get_all_invoices():
    invoices = Invoice.query.all()
    return jsonify([invoice.to_dict() for invoice in invoices]), 200


# ---------------------------
# READ single invoice by ID
# ---------------------------
@payment_bp.route('/invoices/<int:invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404
    return jsonify(invoice.to_dict()), 200


# ---------------------------
# UPDATE invoice
# ---------------------------
@payment_bp.route('/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    try:
        data = request.get_json()

        invoice.client_id = data.get('client_id', invoice.client_id)
        invoice.case_id = data.get('case_id', invoice.case_id)
        invoice.invoice_number = data.get('invoice_number', invoice.invoice_number)
        invoice.issue_date = datetime.strptime(data.get('issue_date'), "%Y-%m-%d").date() if data.get('issue_date') else invoice.issue_date
        invoice.due_date = datetime.strptime(data.get('due_date'), "%Y-%m-%d").date() if data.get('due_date') else invoice.due_date
        invoice.total_amount = data.get('total_amount', invoice.total_amount)
        invoice.status = data.get('status', invoice.status)
        invoice.description = data.get('description', invoice.description)

        db.session.commit()
        return jsonify({"message": "Invoice updated successfully", "invoice": invoice.to_dict()}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400


# ---------------------------
# DELETE invoice
# ---------------------------
@payment_bp.route('/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({"message": f"Invoice {invoice_id} deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
    




@payment_bp.route("/send_invoice/<int:invoice_id>", methods=["POST"])
def send_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    client = invoice.client
    if not client or not client.email:
        return jsonify({"error": "Client email not found"}), 400

    # Render HTML template
    html_content = render_template("invoice_email.html", invoice=invoice, client=client,datetime=datetime)

    msg = Message(
        subject=f"Nyayadeep Invoice #{invoice.invoice_number}",
        sender=("Nyayadeep Legal Services", "no-reply@nyayadeep.com"),
        recipients=[client.email],
        html=html_content
    )

    try:
        mail.send(msg)
        return jsonify({"message": f"Invoice sent to {client.email}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500