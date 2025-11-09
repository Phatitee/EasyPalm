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

    # --- (★ ★ ★ จุดแก้ไข ★ ★ ★) ---
    # เปลี่ยนจากการอ้างอิงไฟล์ .db มาเป็น DATABASE_URL จาก Vercel
    
    # ดึงค่า DATABASE_URL จาก Environment Variable
    database_url = os.environ.get('postgresql://postgres:pat1058pat@db.vtmntlxdbrpfpfvvvbgb.supabase.co:5432/postgres')

    if not database_url:
        # ถ้าหา DATABASE_URL ไม่เจอ (เช่น ตอนรันในเครื่อง) ให้ใช้ SQLite เป็นค่าเริ่มต้น
        print("WARNING: DATABASE_URL not set, falling back to local sqlite.")
        basedir = os.path.abspath(os.path.dirname(__file__))
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '..', 'easypalm.db')
    else:
        # Vercel มักจะให้ URL ของ Postgres มา ซึ่ง SQLAlchemy 1.x อาจไม่รู้จัก
        # เราต้องแก้ prefix "postgres://" ให้เป็น "postgresql://"
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url

    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    # --- (สิ้นสุดจุดแก้ไข) ---

    # --- Link Extensions to App ---
    db.init_app(app)

    with app.app_context():
        # --- Import models to ensure they are registered with SQLAlchemy ---
        from . import models
        # --- Import and Register Blueprints (Routes) ---
        from . import routes
        app.register_blueprint(routes.bp)

        # --- Create Database Tables from Models ---
        # (หมายเหตุ: Vercel ไม่ควรสั่ง create_all() ใน production 
        # คุณควร migrate ฐานข้อมูลจริงด้วยตนเองก่อน)
        # db.create_all() 
        pass

    return app