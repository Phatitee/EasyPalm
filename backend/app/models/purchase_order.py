# backend/app/models/purchase_order.py

from app import db
from sqlalchemy.orm import relationship
from datetime import datetime

class PurchaseOrder(db.Model):
    __tablename__ = 'purchaseorder'
    purchase_order_number = db.Column(db.String(5), primary_key=True)
    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)
    b_date = db.Column(db.DateTime)
    b_total_price = db.Column(db.Float)
    payment_status = db.Column(db.String(30), default='Unpaid')
    stock_status = db.Column(db.String(30), default='Not Received')

    # --- ( เพิ่มใหม่ ) Field สำหรับเก็บข้อมูลการทำรายการ ---
    created_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))
    paid_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))
    received_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))

    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    paid_date = db.Column(db.DateTime)
    received_date = db.Column(db.DateTime)
    # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---

    # Relationships
    farmer = relationship('Farmer', back_populates='purchase_orders')
    items = relationship('PurchaseOrderItem', back_populates='purchase_order', cascade="all, delete-orphan")

    # --- ( เพิ่มใหม่ ) Relationships ไปยัง Employee ---
    created_by = relationship('Employee', foreign_keys=[created_by_id])
    paid_by = relationship('Employee', foreign_keys=[paid_by_id])
    received_by = relationship('Employee', foreign_keys=[received_by_id])
    # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---

    def to_dict(self):
        return {
            'purchase_order_number': self.purchase_order_number,
            'f_id': self.f_id,
            'farmer_name': self.farmer.f_name if self.farmer else None,
            'b_date': self.b_date.isoformat() if self.b_date else None,
            'b_total_price': self.b_total_price,
            'payment_status': self.payment_status,
            'stock_status': self.stock_status,
            'items': [item.to_dict() for item in self.items],
            
            # --- ( เพิ่มใหม่ ) ส่งข้อมูลพนักงานและวันที่กลับไปให้ Frontend ---
            'created_by_name': self.created_by.e_name if self.created_by else None,
            'paid_by_name': self.paid_by.e_name if self.paid_by else None,
            'received_by_name': self.received_by.e_name if self.received_by else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            'received_date': self.received_date.isoformat() if self.received_date else None,
            # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---
        }