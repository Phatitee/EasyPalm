# backend/app/models/purchase_order.py
from app import db
# ตรวจสอบว่ามีการ import PurchaseOrderItem ถูกต้อง
from .purchase_order_item import PurchaseOrderItem 

class PurchaseOrder(db.Model):
    __tablename__ = 'purchaseorder'
    purchase_order_number = db.Column(db.String(5), primary_key=True)
    b_date = db.Column(db.DateTime)
    b_total_price = db.Column(db.Float)
    payment_status = db.Column(db.String(20))

    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)

    # --- Relationships ---
    farmer = db.relationship('Farmer', back_populates='purchase_orders')
    stock_ins = db.relationship('StockTransactionIn', back_populates='purchase_order')

    # --- แก้ไข/ตรวจสอบบรรทัดนี้: ต้องมี back_populates='purchase_order' ---
    items = db.relationship('PurchaseOrderItem', back_populates='purchase_order', cascade="all, delete-orphan")

    def to_dict(self):
        """
        แปลง Object เป็น Dictionary ให้ตรงกับโครงสร้างปัจจุบัน
        """
        return {
            'purchase_order_number': self.purchase_order_number,
            'b_date': self.b_date.isoformat() if self.b_date else None,
            'b_total_price': self.b_total_price,
            'payment_status': self.payment_status,
            'farmer_name': self.farmer.f_name if self.farmer else 'N/A',
            # ส่วนนี้สำคัญมาก ที่จะแปลงรายการสินค้าย่อยทั้งหมดไปด้วย
            'items': [item.to_dict() for item in self.items]
        }