import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory,send_file
from flask_login import login_user, logout_user, login_required
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename, safe_join
from extention import db,mail
from models.user_login_model import UserDeatails
from dotenv import load_dotenv
from datetime import datetime
from flask_mail import Mail, Message
import random

load_dotenv()

auth_bp = Blueprint("auth", __name__)


# ---------- LOGIN ----------
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = UserDeatails.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({"message": "Login successful"}), 200

    return jsonify({"error": "Invalid credentials"}), 401


# ---------- SIGNUP ----------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        if request.content_type and request.content_type.startswith("multipart/form-data"):
            name = request.form.get("name")
            email = request.form.get("email")
            password = request.form.get("password")
            phone_number = request.form.get("phone_number")
            photo = request.files.get("photo")
        else:
            data = request.get_json(silent=True) or {}
            name = data.get("name")
            email = data.get("email")
            password = data.get("password")
            phone_number = data.get("phone_number")
            photo = None

        if not all([name, email, password]):
            return jsonify({"error": "Missing required fields"}), 400

        if UserDeatails.query.filter_by(email=email).first():
            return jsonify({"error": "User already exists"}), 400

        # --- Handle photo upload ---
        photo_rel_path = None
        photo_mime = None

        if photo:
            filename = secure_filename(photo.filename)
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            filename = f"{timestamp}_{filename}"

            upload_dir = current_app.config["UPLOAD_FOLDER"]
            os.makedirs(upload_dir, exist_ok=True)

            save_path = os.path.join(upload_dir, filename)
            photo.save(save_path)

            # store only relative path
            photo_rel_path = f"profile_photos/{filename}"
            photo_mime = photo.mimetype

        hashed_pw = generate_password_hash(password)
        new_user = UserDeatails(
            name=name,
            email=email,
            password_hash=hashed_pw,
            phone_number=phone_number,
            photo_path=photo_rel_path,
            photo_mime=photo_mime,
            current_state=False,
        )

        db.session.add(new_user)
        db.session.commit()

        base_url = os.getenv("BASE_URL", request.host_url.rstrip("/")).rstrip("/")
        photo_url = f"{base_url}/users/{new_user.id}/photo" if photo_rel_path else None

        return jsonify({
            "message": "User created successfully",
            "user": {**new_user.to_dict(), "photo_url": photo_url}
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Signup failed: {e}")
        return jsonify({"error": str(e)}), 500

# ---------- LOGOUT ----------
@auth_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully!"})


# ---------- SHOW USERS ----------
@auth_bp.route("/get/all_users")
def show_users():
    base_url = os.getenv("BASE_URL", request.host_url.rstrip("/")).rstrip("/")
    users = UserDeatails.query.all()
    users_data = []

    for u in users:
        data = u.to_dict()
        if u.photo_path:
            data["photo_url"] = f"{base_url}/users/{u.id}/photo"
        users_data.append(data)

    return jsonify(users_data)


# ---------- FETCH USER PHOTO ----------
@auth_bp.route("/users/<int:user_id>/photo", methods=["GET"])
def get_user_photo(user_id):
    try:
        user = UserDeatails.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not user.photo_path:
            return jsonify({"error": "No photo uploaded"}), 404

        # upload_dir = uploads/profile_photos
        upload_dir = current_app.config["UPLOAD_FOLDER"]

        # if you stored "profile_photos/filename.jpg" in DB,
        # strip the prefix to avoid double joining
        rel_path = user.photo_path
        if rel_path.startswith("profile_photos/"):
            rel_path = rel_path.split("profile_photos/", 1)[1]

        safe_path = os.path.join(upload_dir, rel_path)

        print(f"Resolved photo path: {safe_path}")

        if not os.path.exists(safe_path):
            current_app.logger.error(f"File missing: {safe_path}")
            return jsonify({"error": "Photo file missing from server"}), 404

        return send_file(safe_path, mimetype=user.photo_mime)

    except Exception as e:
        current_app.logger.error(f"Photo fetch failed for user {user_id}: {e}")
        return jsonify({"error": "Internal server error while fetching photo"}), 500
    



@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()

    if not data or 'email' not in data:
        return jsonify({'error': 'Email is required'}), 400

    email = data['email']
    user = UserDeatails.query.filter_by(email=email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Generate 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Send OTP via email
    msg = Message(
        subject='Password Reset - OTP Verification',
        sender=current_app.config['MAIL_USERNAME'],
        recipients=[email]
    )
    msg.body = f"Hello {user.name},\n\nYour OTP for password reset is: {otp}\nIt is valid for a few minutes."

    try:
        mail.send(msg)
        return jsonify({
            'message': 'OTP sent to your email successfully.',
            'otp': otp  # Return OTP for frontend verification (temporary)
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to send OTP email: {str(e)}'}), 500
    

@auth_bp.route('/update-password', methods=['PATCH'])
def update_password():
    data = request.get_json()

    if not data or 'email' not in data or 'new_password' not in data:
        return jsonify({'error': 'Email and new password are required'}), 400

    email = data['email']
    new_password = data['new_password']

    user = UserDeatails.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Hash and update password
    user.password_hash= generate_password_hash(new_password)
    db.session.commit()

    return jsonify({'message': 'Password updated successfully'}), 200




