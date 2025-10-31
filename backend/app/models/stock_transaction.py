# backend/app/models/stock_transaction.py
from app import db
from sqlalchemy.orm import relationship

class SalesOrderItemCost(db.Model):
    __tablename__ = 'salesorderitemcost'
    id = db.Column(db.Integer, primary_key=True)
    so_item_id = db.Column(db.Integer, db.ForeignKey('salesorderitem.so_item_id'), nullable=False, index=True)
    cogs = db.Column(db.Float, nullable=False)
    sales_order_item = relationship('SalesOrderItem', back_populates='cost_entry')
    
class StockTransactionIn(db.Model):
    __tablename__ = 'stocktransactionin'
    in_transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    in_transaction_date = db.Column(db.DateTime, nullable=False)
    in_quantity = db.Column(db.Float, nullable=False)
    unit_cost = db.Column(db.Float, nullable=False)
    remaining_quantity = db.Column(db.Float, nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False, index=True)
    warehouse_id = db.Column(db.String(5), db.ForeignKey('warehouse.warehouse_id'), nullable=False, index=True)
    
    # --- (แก้ไข) ทำให้การเชื่อมโยงถูกต้องและชัดเจน ---
    po_item_id = db.Column(db.Integer, db.ForeignKey('purchaseorderitem.po_item_id'), nullable=False)
    purchase_order_item = relationship('PurchaseOrderItem', back_populates='stock_ins')
    
    # --- (ลบออก) ไม่ใช้คอลัมน์และ relationship เจ้าปัญหาแล้ว ---
    # purchase_order_number = db.Column(...)
    # purchase_order = relationship(...)

    product = relationship('Product')
    warehouse = relationship('Warehouse')

class StockTransactionOut(db.Model):
    __tablename__ = 'stocktransactionout'
    out_transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    out_transaction_date = db.Column(db.DateTime, nullable=False)
    out_quantity = db.Column(db.Float, nullable=False)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False, index=True)
    warehouse_id = db.Column(db.String(5), db.ForeignKey('warehouse.warehouse_id'), nullable=False, index=True)

    # --- (แก้ไข) ทำให้การเชื่อมโยงถูกต้องและชัดเจน ---
    so_item_id = db.Column(db.Integer, db.ForeignKey('salesorderitem.so_item_id'), nullable=False)
    sales_order_item = relationship('SalesOrderItem', back_populates='stock_outs')
    
    product = relationship('Product')
    warehouse = relationship('Warehouse')

class StockTransactionReturn(db.Model):
    __tablename__ = 'stocktransactionreturn'
    
    # --- (แก้ไข) เพิ่ม Primary Key กลับเข้ามา ---
    return_transaction_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    return_transaction_date = db.Column(db.DateTime, nullable=False)
    return_quantity = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text)
    p_id = db.Column(db.String(5), db.ForeignKey('product.p_id'), nullable=False, index=True)
    warehouse_id = db.Column(db.String(5), db.ForeignKey('warehouse.warehouse_id'), nullable=False, index=True)
    so_item_id = db.Column(db.Integer, db.ForeignKey('salesorderitem.so_item_id'), nullable=False)
    
    sales_order_item = relationship('SalesOrderItem', back_populates='stock_returns')
    product = relationship('Product')
    warehouse = relationship('Warehouse')