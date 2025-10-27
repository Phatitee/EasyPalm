# backend/app/models/purchase_order.py
from app import db
from sqlalchemy.orm import relationship

class PurchaseOrder(db.Model):
    __tablename__ = 'purchaseorder'
    purchase_order_number = db.Column(db.String(5), primary_key=True)
    b_date = db.Column(db.DateTime)
    b_total_price = db.Column(db.Float)
    payment_status = db.Column(db.String(20))
    stock_status = db.Column(db.String(20), default='Pending') # 'Pending', 'Completed'

    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)
    stock_status = db.Column(db.String(20), default='Pending')

    # --- Relationships ---
    farmer = relationship('Farmer', back_populates='purchase_orders')
    
    # --- (ลบออก) เราจะไม่เชื่อม StockTransactionIn จากตรงนี้แล้ว ---
    # stock_ins = db.relationship('StockTransactionIn', back_populates='purchase_order')
    
    items = relationship('PurchaseOrderItem', back_populates='purchase_order', cascade="all, delete-orphan")

    def to_dict(self):
        # ... โค้ดส่วนนี้เหมือนเดิม ...
        return {
            'purchase_order_number': self.purchase_order_number,
            'b_date': self.b_date.isoformat() if self.b_date else None,
            'b_total_price': self.b_total_price,
            'payment_status': self.payment_status,
            'farmer_name': self.farmer.f_name if self.farmer else 'N/A',
            'items': [item.to_dict() for item in self.items]
        }