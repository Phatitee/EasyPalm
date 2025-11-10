# backend/app/__init__.py

from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

# 1. สร้าง 'db' เป็น Proxy (ยังไม่มี App)
db = SQLAlchemy()

def create_app():
    """
    An application factory.
    """
    # 2. สร้าง App Instance
    app = Flask(__name__)
    
    # 3. โหลด Config (เช่น DATABASE_URL)
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        raise RuntimeError("DATABASE_URL environment variable is not set.")

    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # 4. "ผูก" db Proxy เข้ากับ App ที่ Config แล้ว
    db.init_app(app)
    CORS(app) 

    # 5. ★★★ จุดแก้ไขที่สำคัญ ★★★
    # ย้าย Imports และ Blueprints ออกมานอก app_context
    # และต้องทำ *หลังจาก* db.init_app() เท่านั้น
    
    from . import models 
    from . import routes
    
    app.register_blueprint(routes.bp, url_prefix='/api')

    # 6. คืนค่า App ที่พร้อมใช้งาน
    # (เราเอา 'with app.app_context():' ออกไปทั้งหมด)
    return app