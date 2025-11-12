from flask import Blueprint, request, jsonify,current_app,send_file, abort
from extention import db
from models import Client, Case,UserDeatails,Document
from datetime import datetime
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader


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
    








    
@case_bp.route('/upload/<int:case_id>', methods=['POST'])
def upload_files(case_id):
    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    files = request.files.getlist('documents')
    if not files:
        return jsonify({"error": "No files provided"}), 400

    uploaded_files = []

    for file in files:
        filename = secure_filename(file.filename)
        case_folder = os.path.join(f'{current_app.config['UPLOAD_FOLDER']}/documents', f"case_{case_id}")
        os.makedirs(case_folder, exist_ok=True)
        file_path = os.path.join(case_folder, filename)
        file.save(file_path)

        doc = Document(filename=filename, path=file_path, case=case)
        db.session.add(doc)
        uploaded_files.append(filename)

    db.session.commit()

    return jsonify({
        "message": f"{len(uploaded_files)} file(s) uploaded",
        "files": uploaded_files
    })


@case_bp.route('/case/<int:case_id>/documents', methods=['GET'])
def get_case_documents(case_id):
    case = Case.query.get(case_id)
    if not case:
        return jsonify({"error": "Case not found"}), 404

    documents = [
        {
            "id": doc.id,
            "filename": doc.filename,
            "url": f"/document/{doc.id}"  # a download URL
        }
        for doc in case.documents
    ]

    return jsonify({
        "case_id": case.id,
        "case_title": case.case_title,
        "documents": documents
    })


@case_bp.route('/document/<int:doc_id>', methods=['GET'])
def get_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        abort(404, description="Document not found")

    if not os.path.exists(doc.path):
        abort(404, description="File missing on server")

    return send_file(doc.path, as_attachment=True)


@case_bp.route('/document/<int:doc_id>/preview', methods=['GET'])
def preview_document(doc_id):
    doc = Document.query.get(doc_id)
    if not doc:
        abort(404, description="Document not found")

    if not os.path.exists(doc.path):
        abort(404, description="File missing on server")

    # Inline preview (PDFs, images, text, etc.)
    return send_file(doc.path, as_attachment=False)





@case_bp.route("/documents/<int:doc_id>", methods=["DELETE"])
def delete_document(doc_id):
    """Delete a document by ID (both from DB and disk)."""
    # Get the document from DB
    doc = Document.query.get(doc_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404

    # Compute the full path (handle safe deletion)
    file_path = os.path.join(f'{current_app.config["UPLOAD_FOLDER"]}/documents', doc.filename)
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        current_app.logger.warning(f"Failed to delete file: {e}")

    # Delete from DB
    db.session.delete(doc)
    db.session.commit()

    return jsonify({"message": "Document deleted successfully", "doc_id": doc_id}), 200












def extract_text_from_file(file_path):
    """
    Extract text content depending on the file type.
    Supports .pdf and .txt. Ignores other extensions.
    """
    text = ""
    try:
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".pdf":
            reader = PdfReader(file_path)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        elif ext == ".txt":
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()

        else:
            text = "[Unsupported file type]"
    except Exception as e:
        text = f"[Error reading file: {str(e)}]"
    return text



@case_bp.route('/extract_text/<case_id>', methods=['GET'])
def extract_text(case_id):
    case_folder = os.path.join(f'{current_app.config["UPLOAD_FOLDER"]}/documents', case_id)

    if not os.path.exists(case_folder):
        return jsonify({"error": f"No folder found for case {case_id}"}), 404

    documents_data = {}
    for filename in os.listdir(case_folder):
        file_path = os.path.join(case_folder, filename)
        if os.path.isfile(file_path):
            documents_data[filename] = extract_text_from_file(file_path)

    if not documents_data:
        return jsonify({"error": "No readable documents found"}), 404

    return jsonify({
        "case_id": case_id,
        "documents": documents_data
    })
