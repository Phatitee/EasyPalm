from app import db

class Warehouse(db.Model):
    __tablename__ = 'warehouse'
    warehouse_id = db.Column(db.String(5), primary_key=True)
    warehouse_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))
    quantity_available = db.Column(db.Integer)

    def to_dict(self):
        """Converts the Warehouse object to a dictionary for JSON serialization."""
        return {
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse_name,
            'location': self.location,
            'quantity_available': self.quantity_available
        }