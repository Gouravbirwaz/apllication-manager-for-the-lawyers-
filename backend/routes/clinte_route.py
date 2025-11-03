from models import Case,Client
from flask import Blueprint,request,jsonify
from extention import db



clinte_bp=Blueprint("clinte_bp",__name__)


@clinte_bp.route('/clients', methods=['POST'])
def add_client():
    data = request.get_json()
    new_client = Client(
        full_name=data.get('full_name'),
        phone=data.get('phone'),
        email=data.get('email'),
        address=data.get('address'),
        organization=data.get('organization',None)
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify({"message": "Client added", "client": new_client.to_dict()}), 201


@clinte_bp.route('/clients', methods=['GET'])
def get_clients():
    clients = Client.query.all()
    return jsonify([c.to_dict() for c in clients]), 200


@clinte_bp.route('/clients/<int:id>', methods=['DELETE'])
def delete_client(id):
    client = Client.query.get_or_404(id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({"message": "Client deleted"}), 200
