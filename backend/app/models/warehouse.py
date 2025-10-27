# backend/app/models/warehouse.py
from app import db
from sqlalchemy.orm import relationship

class Warehouse(db.Model):
    __tablename__ = 'warehouse'
    warehouse_id = db.Column(db.String(5), primary_key=True)
    warehouse_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(255))
    
    # --- (เพิ่ม) ความจุของคลังสินค้า (หน่วยเป็น kg) ---
    capacity = db.Column(db.Float, nullable=False, default=100000.0)

    stock_levels = relationship('StockLevel', back_populates='warehouse')

    def to_dict(self):
        return {
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse_name,
            'location': self.location,
            'capacity': self.capacity # --- (เพิ่ม) ---
        }