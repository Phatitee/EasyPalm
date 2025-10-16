from app import db

class Warehouse(db.Model):
    __tablename__ = 'warehouse'
    warehouse_id = db.Column(db.String(5), primary_key=True)
    warehouse_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100))

    # ความสัมพันธ์ไปยัง StockLevel
    stock_levels = db.relationship('StockLevel', back_populates='warehouse', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            'warehouse_id': self.warehouse_id,
            'warehouse_name': self.warehouse_name,
            'location': self.location,
        }