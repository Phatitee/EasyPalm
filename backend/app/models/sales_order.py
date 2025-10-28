# backend/app/models/sales_order.py
from app import db
from sqlalchemy.orm import relationship

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    s_date = db.Column(db.DateTime)
    s_total_price = db.Column(db.Float)

    # ★★★ FIX: แก้ไขค่า default ให้เป็น 'Pending' ★★★
    shipment_status = db.Column(db.String(30), default='Pending') # Workflow: Pending -> Shipped -> Delivered
    
    delivery_status = db.Column(db.String(30), default='Not Delivered')
    payment_status = db.Column(db.String(30), default='Unpaid')

    # ★★★ FIX: แก้ไข Foreign Key ให้ชี้ไปที่ตาราง foodindustry ★★★
    F_id = db.Column(db.String(5), db.ForeignKey('foodindustry.F_id'), nullable=False)
    
    # ★★★ FIX: แก้ไข Relationship ให้ถูกต้อง ★★★
    customer = relationship('FoodIndustry', back_populates='sales_orders')
    items = relationship('SalesOrderItem', back_populates='sales_order', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'sale_order_number': self.sale_order_number,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_total_price': self.s_total_price,
            'customer_name': self.customer.F_name if self.customer else None, # ดึงชื่อลูกค้า
            'items': [item.to_dict() for item in self.items],
            'shipment_status': self.shipment_status,
            'delivery_status': self.delivery_status,
            'payment_status': self.payment_status
        }