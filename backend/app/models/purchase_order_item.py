# backend/app/models/purchase_order_item.py
from app import db

class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchaseorderitem'
    po_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    purchase_order_number = db.Column(db.String(5), db.ForeignKey('purchaseorder.purchase_order_number'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    # Relationship ไปยัง Product (ถูกต้องแล้ว)
    product = db.relationship('Product')

    # --- เพิ่ม/ตรวจสอบ Relationship นี้: ต้องมี back_populates='items' ---
    purchase_order = db.relationship('PurchaseOrder', back_populates='items')

    def to_dict(self):
        return {
            'product_name': self.product.p_name if self.product else 'N/A',
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }