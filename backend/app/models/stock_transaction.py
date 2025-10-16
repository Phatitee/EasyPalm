from app import db

class StockTransactionIn(db.Model):
    __tablename__ = 'stocktransactionin'
    in_transaction_id = db.Column(db.String(5), primary_key=True)
    in_transaction_date = db.Column(db.DateTime)
    in_quantity = db.Column(db.Integer, nullable=False)

    # --- Foreign Key ---
    in_po_reference_no = db.Column(db.String(5), db.ForeignKey('purchaseorder.purchase_order_number'))
    
    # --- Relationship ---
    purchase_order = db.relationship('PurchaseOrder', back_populates='stock_ins')


class StockTransactionOut(db.Model):
    __tablename__ = 'stocktransactionout'
    out_transaction_id = db.Column(db.String(5), primary_key=True)
    out_transaction_date = db.Column(db.DateTime)
    out_quantity = db.Column(db.Integer, nullable=False)
    
    # --- Foreign Key ---
    out_so_reference_no = db.Column(db.String(5), db.ForeignKey('salesorder.sale_order_number'))
    
    # --- Relationship ---
    sales_order = db.relationship('SalesOrder', back_populates='stock_outs')


class StockTransactionReturn(db.Model):
    __tablename__ = 'stocktransactionreturn'
    return_transaction_id = db.Column(db.String(5), primary_key=True)
    return_transaction_date = db.Column(db.DateTime)
    return_quantity = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.Text)
    
    # --- Foreign Key ---
    return_so_reference_no = db.Column(db.String(5), db.ForeignKey('salesorder.sale_order_number'))
    
    # --- Relationship ---
    sales_order = db.relationship('SalesOrder', back_populates='stock_returns')