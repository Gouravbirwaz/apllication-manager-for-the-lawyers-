# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail, Message
db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth_bp.login'

mail=Mail()
