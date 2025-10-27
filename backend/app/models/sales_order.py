# backend/app/models/sales_order.py
from app import db
from sqlalchemy.orm import relationship

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    s_date = db.Column(db.DateTime)
    s_total_price = db.Column(db.Float)
    
    # --- (เพิ่ม) คอลัมน์สถานะสำหรับ Workflow ใหม่ ---
    shipment_status = db.Column(db.String(30), default='Pending Request') # 'Pending Request', 'Approved', 'Shipped'
    delivery_status = db.Column(db.String(30), default='Not Delivered') # 'Not Delivered', 'Delivered'
    payment_status = db.Column(db.String(30), default='Unpaid')      # 'Unpaid', 'Paid'

    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)
    
    farmer = relationship('Farmer', back_populates='sales_orders')
    items = relationship('SalesOrderItem', back_populates='sales_order', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'sale_order_number': self.sale_order_number,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_total_price': self.s_total_price,
            'farmer_name': self.farmer.f_name if self.farmer else None,
            'items': [item.to_dict() for item in self.items],
            # --- (เพิ่ม) ส่งสถานะไปด้วย ---
            'shipment_status': self.shipment_status,
            'delivery_status': self.delivery_status,
            'payment_status': self.payment_status
        }