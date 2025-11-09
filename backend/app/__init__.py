# backend/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# --- Initialize Extensions ---
db = SQLAlchemy()

def create_app():
    # --- App Configuration ---
    app = Flask(__name__)
    CORS(app)

    # Database Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '..', 'easypalm.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # --- Link Extensions to App ---
    db.init_app(app)

    with app.app_context():
        # --- Import models to ensure they are registered with SQLAlchemy ---
        from . import models # <--- เพิ่มบรรทัดนี้
        # --- Import and Register Blueprints (Routes) ---
        from . import routes
        app.register_blueprint(routes.bp)
      

        # --- Create Database Tables from Models ---
        db.create_all()

    return app