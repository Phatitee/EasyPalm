from app import db

class SalesOrderItem(db.Model):
    __tablename__ = 'salesorderitem'
    so_item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sale_order_number = db.Column(db.String(5), db.ForeignKey('salesorder.sale_order_number'), nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)

    sales_order = db.relationship('SalesOrder', back_populates='items')
    product = db.relationship('Product', back_populates='sales_order_items')

    def to_dict(self):
        return {
            'product_name': self.product.p_name if self.product else 'N/A',
            'quantity': self.quantity,
            'price_per_unit': self.price_per_unit
        }