from app import db

class Farmer(db.Model):
    __tablename__ = 'farmer'
    f_id = db.Column(db.String(5), primary_key=True)
    f_name = db.Column(db.String(100), nullable=False)
    f_citizen_id_card = db.Column(db.String(20), unique=True, nullable=False)
    f_tel = db.Column(db.String(20), nullable=False)
    f_address = db.Column(db.String(100), nullable=False)
    f_create_date = db.Column(db.DateTime)
    f_modified_date = db.Column(db.DateTime)

    # --- Relationships ---
    # One-to-Many: A farmer can have many purchase orders and sales orders.
    purchase_orders = db.relationship('PurchaseOrder', back_populates='farmer')
    sales_orders = db.relationship('SalesOrder', back_populates='farmer')

    def to_dict(self):
        """แปลง Object ของ Farmer ให้เป็น Dictionary"""
        return {
            'f_id': self.f_id,
            'f_name': self.f_name,
            'f_citizen_id_card': self.f_citizen_id_card,
            'f_tel': self.f_tel,
            'f_address': self.f_address
        }
