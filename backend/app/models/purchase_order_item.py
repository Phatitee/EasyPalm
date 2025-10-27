# backend/app/models/purchase_order_item.py
from app import db
from sqlalchemy.orm import relationship

class PurchaseOrderItem(db.Model):
    __tablename__ = 'purchaseorderitem'
    po_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    purchase_order_number = db.Column(db.String(5), db.ForeignKey('purchaseorder.purchase_order_number'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    product = relationship('Product', back_populates='purchase_order_items')
    purchase_order = relationship('PurchaseOrder', back_populates='items')

    # --- (เพิ่ม) สร้างความสัมพันธ์ไปยัง StockTransactionIn จากตรงนี้ ---
    stock_ins = relationship("StockTransactionIn", back_populates="purchase_order_item")

    def to_dict(self):
        # ... โค้ดส่วนนี้เหมือนเดิม ...
        return {
            'product_name': self.product.p_name if self.product else 'N/A',
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }