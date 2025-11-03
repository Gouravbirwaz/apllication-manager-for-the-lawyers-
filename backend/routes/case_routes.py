from flask import Blueprint, request, jsonify
from extention import db
from models import Client, Case,UserDeatails
from datetime import datetime



case_bp=Blueprint("case_bp",__name__)

@case_bp.route('/cases', methods=['POST'])
def add_case():
    data = request.get_json()
    
    client_id = data.get('client_id')
    advocate_id = data.get('advocate_id')  # optional or required
    case_title = data.get('case_title')
    case_type = data.get('case_type')
    status = data.get('status', 'open')
    next_hearing = data.get('next_hearing')

    if not client_id or not case_title or not case_type:
        return jsonify({"error": "client_id, case_title, and case_type are required"}), 400

    # Validate client
    client = Client.query.get(client_id)
    if not client:
        return jsonify({"error": "Client not found"}), 404

    # Validate advocate if provided
    advocate = None
    if advocate_id:
        advocate = UserDeatails.query.get(advocate_id)
        if not advocate:
            return jsonify({"error": "Advocate not found"}), 404

    # Create the new case
    new_case = Case(
        case_title=case_title,
        case_type=case_type,
        status=status,
        next_hearing=next_hearing,
        client_id=client_id,
        advocate_id=advocate_id if advocate else None
    )
    

    db.session.add(new_case)
    if advocate:
        advocate.total_case_handled = (advocate.total_case_handled or 0) + 1
    db.session.commit()

    # Return case details with client + advocate info
    case_data = new_case.to_dict()
    if advocate:
        case_data['advocate'] = {
            "id": advocate.id,
            "name": advocate.name,
            "email": advocate.email
        }
    else:
        case_data['advocate'] = None

    return jsonify({"message": "Case added successfully", "case": case_data}), 201


@case_bp.route('/cases', methods=['GET'])
def get_cases():
    cases = Case.query.all()
    return jsonify([case.to_dict() for case in cases]), 200


@case_bp.route('/cases/<int:id>', methods=['GET'])
def get_case_info(id):
    case = Case.query.get_or_404(id)
    return jsonify(case.to_dict()), 200

@case_bp.route('/cases/<int:id>', methods=['DELETE'])
def delete_case(id):
    case = Case.query.get_or_404(id)
    db.session.delete(case)
    db.session.commit()
    return jsonify({"message": "Case deleted"}), 200


@case_bp.route('/cases/<int:id>', methods=['PATCH'])
def update_case(id):
    data = request.get_json()
    case = Case.query.get_or_404(id)

    # Allowed fields to update (prevents accidental/unsafe edits)
    allowed_fields = {
        "case_title": str,
        "status": str,
        "case_type": str,
        "next_hearing": str,
        "client_id": int,
        "advocate_id": int
    }

    for field, field_type in allowed_fields.items():
        if field in data:
            value = data[field]

            # Handle date parsing separately
            if field == "next_hearing" and value:
                try:
                    # Converts ISO string like "2025-11-24T18:30:00.000Z"
                    # to Python datetime.date
                    case.next_hearing = datetime.fromisoformat(value.replace("Z", "")).date()
                except ValueError:
                    return jsonify({"error": "Invalid date format for next_hearing"}), 400
            else:
                setattr(case, field, value)

    db.session.commit()

    return jsonify({
        "message": "Case updated successfully",
        "case": case.to_dict()
    }), 200

# -------------------- FETCH CASES WITH CLIENT DETAILS --------------------

@case_bp.route('/cases/with-clients', methods=['GET'])
def get_cases_with_clients():
    cases = Case.query.all()
    return jsonify([case.to_dict() for case in cases]), 200



@case_bp.route('/assign-case', methods=['POST'])
def assign_case():
    data = request.get_json()

    # Validate input
    if not data or 'case_id' not in data or 'advocate_id' not in data:
        return jsonify({'error': 'case_id and advocate_id are required'}), 400

    case_id = data['case_id']
    advocate_id = data['advocate_id']

    # Fetch objects
    case = Case.query.get(case_id)
    advocate = UserDeatails.query.get(advocate_id)

    if not case:
        return jsonify({'error': 'Case not found'}), 404
    if not advocate:
        return jsonify({'error': 'Advocate not found'}), 404

    # Assign advocate
    case.advocate_id = advocate.id

    try:
        db.session.commit()
        return jsonify({
            'message': f'Case {case.id} successfully assigned to advocate {advocate.name}'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to assign case: {str(e)}'}), 500