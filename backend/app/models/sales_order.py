from app import db

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    s_date = db.Column(db.DateTime)
    s_quantity = db.Column(db.Integer, nullable=False)
    s_total_price = db.Column(db.Float)

    # --- Foreign Keys ---
    f_id = db.Column(db.String(5), db.ForeignKey('farmer.f_id'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    
    # --- Relationships ---
    # Many-to-One: Many sales orders belong to one farmer and one product.
    farmer = db.relationship('Farmer', back_populates='sales_orders')
    product = db.relationship('Product', back_populates='sales_orders')
    
    # One-to-Many: One sales order can have many stock-out and return transactions.
    stock_outs = db.relationship('StockTransactionOut', back_populates='sales_order')
    stock_returns = db.relationship('StockTransactionReturn', back_populates='sales_order')

    def to_dict(self):
        return{
            'sale_order_number': self.sale_order_number,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_quantity': self.s_quantity,
            's_total_price': self.s_total_price,
            'f_id': self.f_id,
            'p_id': self.p_id
        }