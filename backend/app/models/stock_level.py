from app import db

class StockLevel(db.Model):
    __tablename__ = 'stocklevel'
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Float, nullable=False, default=0)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False)
    warehouse_id = db.Column(db.String(5), db.ForeignKey('warehouse.warehouse_id'), nullable=False)
    
    
    product = db.relationship('Product', back_populates='stock_levels')
    warehouse = db.relationship('Warehouse', back_populates='stock_levels')

    def to_dict(self):
        return {
            'product_id': self.p_id,
            'product_name': self.product.p_name if self.product else 'N/A',
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse.warehouse_name if self.warehouse else 'N/A',
            'quantity': self.quantity
        }