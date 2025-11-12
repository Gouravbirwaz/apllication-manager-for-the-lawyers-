import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory,send_file
from flask_login import login_user, logout_user, login_required,current_user
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename, safe_join
from extention import db,mail,login_manager
from models.user_login_model import UserDeatails
from dotenv import load_dotenv
from datetime import datetime
from flask_mail import Mail, Message
import random
from functools import wraps


adv_bp=Blueprint("adv_bp",__name__)


def main_role_required(f):
    """Decorator to restrict access to users with 'main' role."""
    @wraps(f)
    @login_required 
    def decorated_function(*args, **kwargs):
        # The user must be logged in, and their role must be 'main'
        if not current_user.is_authenticated or current_user.role != 'main':
            return jsonify({"error": "Permission denied. This operation requires the 'main' administrative role."}), 403
        return f(*args, **kwargs)
    return decorated_function

# --- Helper Function for Input Validation ---

def validate_user_data(data, is_creation=True):
    """Basic validation for user data fields."""
    errors = {}
    if is_creation:
        if not data.get('email') or '@' not in data['email']:
            errors['email'] = "Valid email is required."
        if not data.get('password') or len(data['password']) < 6:
            errors['password'] = "Password must be at least 6 characters."
        if not data.get('name'):
            errors['name'] = "Name is required."
    
    # Check for non-admin attempting to set the role on creation/update
    # Only the current 'main' user can assign the 'main' role
    if data.get('role') and data.get('role').lower() == 'main' and current_user.role != 'main':
        errors['role'] = "Only existing 'main' users can assign the 'main' role."

    return errors

# --- 1. CREATE USER (Main Role Only) ---
@adv_bp.route('/users', methods=['POST'])
@main_role_required
def create_user():
    """Endpoint to create a new user (Requires 'main' role)."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided."}), 400

    validation_errors = validate_user_data(data)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    if UserDeatails.query.filter_by(email=data['email']).first():
        return jsonify({"error": "A user with this email already exists."}), 409

    try:
        new_user = UserDeatails(
            name=data.get('name'),
            email=data.get('email'),
            phone_number=data.get('phone_number'),
            role=data.get('role', 'user'), # Default role is 'user'
            total_case_handled=data.get('total_case_handled', 0),
            gpay_upi_id=data.get('gpay_upi_id')
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        # Return the created user data
        return jsonify({
            "message": "User created successfully.",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error during creation: {str(e)}"}), 500


# --- 2. READ USER LIST (Requires Login) ---
@adv_bp.route('/users', methods=['GET'])
@login_required 
def get_users():
    """Endpoint to list all users (Requires any logged-in user)."""
    # Only 'main' users see sensitive data like UPI ID or photo_mime
    include_sensitive = current_user.role == 'main' 
    
    users = UserDeatails.query.all()
    user_list = [user.to_dict(include_sensitive=include_sensitive) for user in users]
    return jsonify({"users": user_list, "count": len(user_list)}), 200

# --- 3. READ SINGLE USER (Requires Login) ---
@adv_bp.route('/users/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """Endpoint to get a single user by ID (Requires any logged-in user)."""
    user = db.session.get(UserDeatails, user_id)
    if user is None:
        return jsonify({"error": f"User with ID {user_id} not found."}), 404
    
    # Allow users to see their own sensitive data, or if the requester is 'main'
    include_sensitive = (current_user.id == user.id) or (current_user.role == 'main')
    
    return jsonify({"user": user.to_dict(include_sensitive=include_sensitive)}), 200


# --- 4. UPDATE USER (Main Role Only or Self-Update) ---
@adv_bp.route('/users/<int:user_id>', methods=['PUT', 'PATCH'])
@login_required
def update_user(user_id):
    """Endpoint to update a user (Requires 'main' role or updating own profile)."""
    user = db.session.get(UserDeatails, user_id)
    if user is None:
        return jsonify({"error": f"User with ID {user_id} not found."}), 404

    # Authorization Check: Must be 'main' role OR the user is updating their own profile
    is_self_update = current_user.id == user.id
    if current_user.role != 'main' and not is_self_update:
        return jsonify({"error": "Permission denied. You can only update your own profile unless you have the 'main' role."}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided for update."}), 400

    # Validate against attempts to change role if not 'main'
    validation_errors = validate_user_data(data, is_creation=False)
    if validation_errors:
        return jsonify({"errors": validation_errors}), 400

    try:
        # Update allowed fields for everyone
        user.name = data.get('name', user.name)
        user.phone_number = data.get('phone_number', user.phone_number)
        user.current_state = data.get('current_state', user.current_state)
        user.is_active = data.get('is_active', user.is_active)
        
        if 'password' in data and data['password']:
            user.set_password(data['password'])

        # Role, Case count, and sensitive data update logic
        if current_user.role == 'main':
            # Main users can update everything
            user.role = data.get('role', user.role)
            user.total_case_handled = data.get('total_case_handled', user.total_case_handled)
            user.gpay_upi_id = data.get('gpay_upi_id', user.gpay_upi_id)
        
        # Self-update (non-main user) can only update their own sensitive data
        elif is_self_update:
            user.gpay_upi_id = data.get('gpay_upi_id', user.gpay_upi_id)


        db.session.commit()
        # Return sensitive data if it was a self-update or an admin update
        return jsonify({
            "message": "User updated successfully.",
            "user": user.to_dict(include_sensitive=is_self_update or current_user.role == 'main')
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error during update: {str(e)}"}), 500


# --- 5. DELETE USER (Main Role Only) ---
@adv_bp.route('/users/<int:user_id>', methods=['DELETE'])
@main_role_required
def delete_user(user_id):
    """Endpoint to delete a user (Requires 'main' role)."""
    user = db.session.get(UserDeatails, user_id)
    if user is None:
        return jsonify({"message": f"User with ID {user_id} not found (may already be deleted)."}), 200
    
    # Prevent a 'main' user from deleting themselves (if they are the only admin)
    if user.id == current_user.id and current_user.role == 'main':
        main_users_count = UserDeatails.query.filter_by(role='main').count()
        if main_users_count <= 1:
             return jsonify({"error": "Cannot delete the last 'main' administrative user. Assign another 'main' user first."}), 403


    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": f"User with ID {user_id} deleted successfully."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error during deletion: {str(e)}"}), 500



@adv_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    from flask_login import logout_user
    logout_user()
    return jsonify({"message": "Successfully logged out."}), 200

# --- 7. INITIAL SETUP ROUTE (Creates a default 'main' user if none exists) ---
@adv_bp.route('/setup/init_admin', methods=['POST'])
def init_admin():
    """Initial setup route to create the very first 'main' administrator."""
    if UserDeatails.query.filter_by(role='main').first():
        return jsonify({"message": "An admin user already exists. Initial setup skipped."}), 200

    data = request.get_json()
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
         return jsonify({"error": "Initial admin setup requires name, email, and password."}), 400

    try:
        admin_user = UserDeatails(
            name=data['name'],
            email=data['email'],
            role='main',
            is_active=True,
            total_case_handled=0
        )
        admin_user.set_password(data['password'])

        db.session.add(admin_user)
        db.session.commit()
        return jsonify({"message": "Initial 'main' administrator created successfully."}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to create initial admin: {str(e)}"}), 500

