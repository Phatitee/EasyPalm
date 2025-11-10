# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os  # ★★★ Import os ★★★

# Initialize the database instance
db = SQLAlchemy()

def create_app(): # ★★★ 1. ลบ 'config_object' ออก ★★★
    """
    An application factory.
    """
    app = Flask(__name__)
    
    # ★★★ 2. โหลด Database URL จาก Environment Variable ★★★
    # Vercel จะเก็บ URL ของ Postgres ไว้ในตัวแปรชื่อ 'DATABASE_URL'
    db_url = os.environ.get('DATABASE_URL')

    if not db_url:
        # ถ้าหาไม่เจอ ให้แจ้งเตือน (สำคัญมากตอน debug)
        raise RuntimeError("DATABASE_URL environment variable is not set.")

    # ★★★ 3. แก้ไข URL สำหรับ SQLAlchemy ★★★
    # Vercel อาจให้ URL ที่ขึ้นต้นด้วย 'postgres://' 
    # แต่ SQLAlchemy ต้องการ 'postgresql://'
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    CORS(app) # Enable CORS for all routes

    with app.app_context():
        # Import all models to make them known to SQLAlchemy
        from . import models

        # Import and register the blueprint for API routes
        from . import routes
        
        # ★★★ 4. คงการตั้งค่า 'url_prefix' ไว้เหมือนเดิม ★★★
        app.register_blueprint(routes.bp, url_prefix='/api')

        # Create database tables for all models
        db.create_all()

    return app