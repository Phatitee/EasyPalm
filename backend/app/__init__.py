# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# Initialize the database instance
db = SQLAlchemy()

def create_app(config_object='config.Config'): # ★★★ ใช้ config.Config เป็นค่าเริ่มต้น ★★★
    """
    An application factory.
    :param config_object: The configuration object to use.
    """
    app = Flask(__name__)
    
    # ★★★ โหลดการตั้งค่าจาก object ที่ส่งเข้ามา ★★★
    app.config.from_object(config_object)

    # Initialize extensions
    db.init_app(app)
    CORS(app) # Enable CORS for all routes

    with app.app_context():
        # Import all models to make them known to SQLAlchemy
        from . import models

        # Import and register the blueprint for API routes
        from . import routes
        
        # ★★★ แก้ไขบรรทัดนี้: เพิ่ม url_prefix='/api' ★★★
        app.register_blueprint(routes.bp, url_prefix='/api')

        # Create database tables for all models
        db.create_all()

    return app