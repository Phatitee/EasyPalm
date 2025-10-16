# backend/app/models/purchase_order_item.py
from app import db

class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchaseorderitem'
    po_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    purchase_order_number = db.Column(db.String(5), db.ForeignKey('purchaseorder.purchase_order_number'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    # --- (จุดที่ 2 ที่ต้องแก้) แก้ไข Relationship นี้: เพิ่ม back_populates='purchase_order_items' ---
    product = db.relationship('Product', back_populates='purchase_order_items')

    # Relationship กลับไปยังใบสั่งซื้อแม่ (อันนี้ถูกต้องแล้ว)
    purchase_order = db.relationship('PurchaseOrder', back_populates='items')

    def to_dict(self):
        return {
            'product_name': self.product.p_name if self.product else 'N/A',
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }