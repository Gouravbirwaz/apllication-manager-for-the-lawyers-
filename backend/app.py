from flask import Flask
from flask_cors import CORS
from extention import db, login_manager,mail
from flask_migrate import Migrate
from config import Config 
def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost:3306/law'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = 'supersecretkey'
    app.config['UPLOAD_FOLDER'] = 'media'
    app.config['MAIL_SERVER'] = 'smtp.gmail.com' 
    CORS(app)
    mail.init_app(app)

    db.init_app(app)
    login_manager.init_app(app) 
    Migrate(app, db)

    from routes import auth_bp,case_bp,clinte_bp,payment_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(case_bp)
    app.register_blueprint(clinte_bp)
    app.register_blueprint(payment_bp)


    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=8080, debug=True)
