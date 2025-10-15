from app import db
from .food_industry import FoodIndustry

class SalesOrder(db.Model):
    __tablename__ = 'salesorder'
    sale_order_number = db.Column(db.String(5), primary_key=True)
    food_industry_id = db.Column(db.String(5), db.ForeignKey('foodindustry.F_id'), nullable=False)
    s_date = db.Column(db.DateTime)
    s_total_price = db.Column(db.Float)


    # relationships

    items = db.relationship('SalesOrderItem', back_populates='sales_order', cascade="all, delete-orphan")
    food_industry = db.relationship('FoodIndustry', back_populates='sales_orders')


    stock_outs = db.relationship('StockTransactionOut', back_populates='sales_order')
    stock_returns = db.relationship('StockTransactionReturn', back_populates='sales_order')

    def to_dict(self):
        return {
            'sale_order_number': self.sale_order_number,
            'food_industry_id': self.food_industry_id,
            's_date': self.s_date.isoformat() if self.s_date else None,
            's_total_price': self.s_total_price,
            'items': [item.to_dict() for item in self.items]
        }
    def __repr__(self):
        return f'<SalesOrder {self.sale_order_number}>'