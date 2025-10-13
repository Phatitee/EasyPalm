from app import db

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    s_date = db.Column(db.DateTime)
    s_total_price = db.Column(db.Float)
    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)
    
    farmer = db.relationship('Farmer', back_populates='sales_orders')
    
    # ลบ p_id และ s_quantity ออก แล้วเพิ่ม relationship ใหม่
    farmer = db.relationship('Farmer', back_populates='sales_orders')
    items = db.relationship('SalesOrderItem', back_populates='sales_order', cascade="all, delete-orphan")

    stock_outs = db.relationship('StockTransactionOut', back_populates='sales_order')
    stock_returns = db.relationship('StockTransactionReturn', back_populates='sales_order')

    def to_dict(self):
        return {
            'sale_order_number': self.sale_order_number,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_total_price': self.s_total_price,
            'farmer_name': self.farmer.f_name if self.farmer else None,
            'items': [item.to_dict() for item in self.items]
        }
    def __repr__(self):
        return f'<SalesOrder {self.sale_order_number}>'