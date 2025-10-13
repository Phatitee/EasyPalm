# backend/app/models/product.py
from app import db
from datetime import datetime

class Product(db.Model):
    __tablename__ = 'product'
    p_id = db.Column(db.String(5), primary_key=True)
    p_name = db.Column(db.String(100), nullable=False)
    price_per_unit = db.Column(db.Float)
    effective_date = db.Column(db.DateTime)

    # --- Relationships ---
    sales_orders = db.relationship('SalesOrder', back_populates='product')

    # --- (จุดที่ 1 ที่ต้องแก้) เพิ่มความสัมพันธ์นี้เข้าไป ---
    # บอกว่า Product 1 ตัว สามารถอยู่ใน "รายการสินค้าที่ถูกซื้อ" (PurchaseOrderItem) ได้หลายครั้ง
    purchase_order_items = db.relationship('PurchaseOrderItem', back_populates='product')

    def to_dict(self):
        return {
            'p_id': self.p_id,
            'p_name': self.p_name,
            'price_per_unit': self.price_per_unit,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None
        }