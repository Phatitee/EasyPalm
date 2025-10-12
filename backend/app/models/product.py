# backend/app/models/product.py
from app import db
from datetime import datetime # อาจจะต้อง import datetime ถ้ามีการใช้งาน

class Product(db.Model):
    __tablename__ = 'product'
    p_id = db.Column(db.String(5), primary_key=True)
    p_name = db.Column(db.String(100), nullable=False)
    price_per_unit = db.Column(db.Float)
    effective_date = db.Column(db.DateTime)

    # --- Relationships ---
    #purchase_orders = db.relationship('PurchaseOrder', back_populates='product')
    sales_orders = db.relationship('SalesOrder', back_populates='product')

    # --- เพิ่มฟังก์ชันนี้เข้าไป ---
    def to_dict(self):
        """Converts the Product object to a dictionary for JSON serialization."""
        return {
            'p_id': self.p_id,
            'p_name': self.p_name,
            'price_per_unit': self.price_per_unit,
            # Convert datetime to string if it exists, otherwise None
            'effective_date': self.effective_date.isoformat() if self.effective_date else None
        }