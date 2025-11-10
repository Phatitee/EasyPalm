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
    
    # ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    # ★★★ นี่คือจุดแก้ไข CORS ที่ถูกต้องและแม่นยำที่สุด ★★★
    # ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    
    # แทนที่ 'CORS(app)' เดิม ด้วยโค้ดนี้:
    # ระบุชัดเจนว่าให้รับ Request จาก Frontend Domain ของคุณเท่านั้น
    CORS(app, resources={
        r"/api/*": {
            "origins": "https://easy-palm-frontend.vercel.app"
        }
    })
    # ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    # 5. ย้าย Imports และ Blueprints ออกมานอก app_context
    # (เหมือนเดิม)
    
    from . import models 
    from . import routes
    
    app.register_blueprint(routes.bp, url_prefix='/api')

    # 6. คืนค่า App ที่พร้อมใช้งาน
    return app