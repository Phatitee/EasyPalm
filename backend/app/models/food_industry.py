from app import db
from datetime import datetime

class FoodIndustry(db.Model):
    __tablename__ = 'foodindustry'
    F_id = db.Column(db.String(5), primary_key=True)
    F_name = db.Column(db.String(100), nullable=False)
    F_tel = db.Column(db.String(15))
    F_address = db.Column(db.Text)
    F_createDate = db.Column(db.DateTime, default=datetime.utcnow)
    F_modifiedDate = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # ความสัมพันธ์: อาจจะผูกกับ SalesOrder ในอนาคต
    # sales_orders = db.relationship('SalesOrder', back_populates='food_industry')

    def to_dict(self):
        return {
            'F_id': self.F_id,
            'F_name': self.F_name,
            'F_tel': self.F_tel,
            'F_address': self.F_address,
            'F_createDate': self.F_createDate.isoformat() if self.F_createDate else None
        }