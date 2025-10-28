# backend/app/models/sales_order.py
from app import db
from sqlalchemy.orm import relationship
from datetime import datetime # เพิ่ม datetime

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    s_date = db.Column(db.DateTime)
    s_total_price = db.Column(db.Float)

    shipment_status = db.Column(db.String(30), default='Pending')
    delivery_status = db.Column(db.String(30), default='Not Delivered')
    payment_status = db.Column(db.String(30), default='Unpaid')

    F_id = db.Column(db.String(5), db.ForeignKey('foodindustry.F_id'), nullable=False)

    # --- ( เพิ่มใหม่ ) Field สำหรับเก็บข้อมูลการทำรายการ ---
    created_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))
    shipped_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))
    delivered_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))
    paid_by_id = db.Column(db.String(5), db.ForeignKey('employee.e_id'))

    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    shipped_date = db.Column(db.DateTime)
    delivered_date = db.Column(db.DateTime)
    paid_date = db.Column(db.DateTime)
    # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---


    customer = relationship('FoodIndustry', back_populates='sales_orders')
    items = relationship('SalesOrderItem', back_populates='sales_order', cascade="all, delete-orphan")

    # --- ( เพิ่มใหม่ ) Relationships ไปยัง Employee ---
    created_by = relationship('Employee', foreign_keys=[created_by_id])
    shipped_by = relationship('Employee', foreign_keys=[shipped_by_id])
    delivered_by = relationship('Employee', foreign_keys=[delivered_by_id])
    paid_by = relationship('Employee', foreign_keys=[paid_by_id])
    # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---


    def to_dict(self):
        return {
            'sale_order_number': self.sale_order_number,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_total_price': self.s_total_price,
            'customer_name': self.customer.F_name if self.customer else None,
            'items': [item.to_dict() for item in self.items],
            'shipment_status': self.shipment_status,
            'delivery_status': self.delivery_status,
            'payment_status': self.payment_status,

            # --- ( เพิ่มใหม่ ) ส่งข้อมูลพนักงานและวันที่กลับไปให้ Frontend ---
            'created_by_name': self.created_by.e_name if self.created_by else None,
            'shipped_by_name': self.shipped_by.e_name if self.shipped_by else None,
            'delivered_by_name': self.delivered_by.e_name if self.delivered_by else None,
            'paid_by_name': self.paid_by.e_name if self.paid_by else None,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'shipped_date': self.shipped_date.isoformat() if self.shipped_date else None,
            'delivered_date': self.delivered_date.isoformat() if self.delivered_date else None,
            'paid_date': self.paid_date.isoformat() if self.paid_date else None,
            # --- ( สิ้นสุดส่วนที่เพิ่มใหม่ ) ---
        }