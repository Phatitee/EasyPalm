# backend/app/models/product.py
from app import db # import db จาก app package หลัก

class Product(db.Model):
    __tablename__ = 'product'
    p_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    p_name = db.Column(db.String(100), nullable=False)
    price_per_unit = db.Column(db.Float, nullable=False)
    effective_date = db.Column(db.Date, nullable=False)

    def to_dict(self):
        return {
            'p_id': self.p_id,
            'p_name': self.p_name,
            'price_per_unit': self.price_per_unit,
            'effective_date': self.effective_date.isoformat()
        }