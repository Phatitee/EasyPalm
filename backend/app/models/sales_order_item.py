# backend/app/models/sales_order_item.py
from app import db
from sqlalchemy.orm import relationship

class SalesOrderItem(db.Model):
    __tablename__ = 'salesorderitem'
    so_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sale_order_number = db.Column(db.String(5), db.ForeignKey('salesorder.sale_order_number'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    sales_order = relationship('SalesOrder', back_populates='items')
    
    product = relationship('Product', back_populates='sales_order_items')
    
    costs = relationship('SalesOrderItemCost', back_populates='sales_order_item', cascade="all, delete-orphan")
    stock_outs = relationship("StockTransactionOut", back_populates="sales_order_item")
    stock_returns = relationship("StockTransactionReturn", back_populates="sales_order_item")

    def to_dict(self):
        return {
            # ★★★ เพิ่ม p_id เข้าไปในนี้ ★★★
            'p_id': self.p_id,
            'product_name': self.product.p_name if self.product else 'N/A',
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }