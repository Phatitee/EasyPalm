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
    purchase_order_items = db.relationship('PurchaseOrderItem', back_populates='product')
    stock_levels = db.relationship('StockLevel', back_populates='product', cascade="all, delete-orphan")
    sales_order_items = db.relationship('SalesOrderItem', back_populates='product', cascade="all, delete-orphan")
    # --- (นี่คือบรรทัดที่ขาดไป!) เพิ่มความสัมพันธ์ไปยัง StockLevel ---
    stock_levels = db.relationship('StockLevel', back_populates='product', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'p_id': self.p_id,
            'p_name': self.p_name,
            'price_per_unit': self.price_per_unit,
            'effective_date': self.effective_date.isoformat() if self.effective_date else None
        }