# backend/seed.py
from app import create_app, db
from app.models import (
    Employee, Farmer, FoodIndustry, Product, Warehouse,
    PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem,
    StockLevel, StockTransactionIn, StockTransactionOut, SalesOrderItemCost, StockTransactionReturn, EmployeeRole)
from datetime import datetime, timedelta
import random

def clear_data():
    """Deletes all data from the tables in the correct order."""
    # This order is crucial to avoid foreign key constraint errors
    db.session.query(SalesOrderItemCost).delete()
    db.session.query(StockTransactionReturn).delete()
    db.session.query(StockTransactionOut).delete()
    db.session.query(StockTransactionIn).delete()
    db.session.query(SalesOrderItem).delete()
    db.session.query(PurchaseOrderItem).delete()
    db.session.query(StockLevel).delete()
    db.session.query(SalesOrder).delete()
    db.session.query(PurchaseOrder).delete()
    db.session.query(Warehouse).delete()
    db.session.query(Product).delete()
    db.session.query(FoodIndustry).delete()
    db.session.query(Farmer).delete()
    db.session.query(Employee).delete()
    db.session.commit()
    print("🧹 All existing data has been cleared.")

def seed_data():
    """Seeds the database with initial sample data."""
    print("🌱 Starting to seed the database...")

    # --- Basic Data ---
    warehouses = [
        Warehouse(warehouse_id='W001', warehouse_name='คลังสินค้าหลัก', location='สำนักงานใหญ่', capacity=500000.0),
        Warehouse(warehouse_id='W002', warehouse_name='คลังสินค้าย่อย', location='สาขาย่อย 1', capacity=100000.0)
    ]
    employees = [
        Employee(e_id='E001', e_name='แอดมิน ใหญ่สุด', e_gender='Male', e_citizen_id_card='1111111111111', e_tel='0800000001', e_citizen_address='Admin Address', e_email='admin@easypalm.com', e_address='Admin Address', position='System Administrator', e_role=EmployeeRole.ADMIN, username='admin', password='123', is_active=True),
        Employee(e_id='E002', e_name='สมศรี ฝ่ายขาย', e_gender='Female', e_citizen_id_card='2222222222222', e_tel='0800000002', e_citizen_address='Sales Address', e_email='sales@easypalm.com', e_address='Sales Address', position='Sales Representative', e_role=EmployeeRole.SALES, username='sales', password='123', is_active=True),
        Employee(e_id='E003', e_name='มานี การเงิน', e_gender='Female', e_citizen_id_card='3333333333333', e_tel='0800000003', e_citizen_address='Finance Address', e_email='finance@easypalm.com', e_address='Finance Address', position='Finance Officer', e_role=EmployeeRole.ACCOUNTANT, username='accountant', password='123', is_active=True),
        Employee(e_id='E004', e_name='สมศักดิ์ คลังใหญ่', e_gender='Male', e_citizen_id_card='4444444444444', e_tel='0800000004', e_citizen_address='Warehouse Address', e_email='warehouse@easypalm.com', e_address='Warehouse Address', position='Warehouse Officer', e_role=EmployeeRole.WAREHOUSE, username='warehouse', password='123', is_active=True),
        Employee(e_id='E005', e_name='สุดา จัดซื้อ', e_gender='Female', e_citizen_id_card='5555555555555', e_tel='0800000005', e_citizen_address='Purchasing Address', e_email ='purchasing@easypalm.com', e_address='Purchasing Address', position='Purchasing Officer', e_role=EmployeeRole.PURCHASING, username='purchasing', password='123', is_active=True),
        Employee(e_id='E006', e_name='วิรัช ผู้บริหาร', e_gender='Male', e_citizen_id_card='6666666666666', e_tel='0800000006', e_citizen_address='Executive Address',e_email = 'executive@easypalm.com', e_address='Executive Address', position='Executive Officer', e_role=EmployeeRole.EXECUTIVE, username='executive', password='123', is_active=True),
        Employee(e_id='E007', e_name='มานะ ไม่ใช้งาน', e_gender='Male', e_citizen_id_card='7777777777777', e_tel='0800000007', e_citizen_address='Suspended Address',e_email = 'inactive@easypalm.com', e_address='Suspended Address', position='Former Employee', e_role=EmployeeRole.SALES, username='inactive', password='123', is_active=False, suspension_date=datetime.utcnow() - timedelta(days=5))
    ]
    farmers = [
        Farmer(f_id='F001', f_name='สมชาย สวนปาล์ม', f_citizen_id_card='1234567890121', f_tel='0812345678', f_address='123 หมู่ 5 ต.ปาล์ม อ.เกษตรสุข จ.สมุทรสงคราม',f_create_date=datetime.utcnow()-timedelta(days=30), f_modified_date=datetime.utcnow()-timedelta(days=1)),
        Farmer(f_id='F002', f_name='สมศรี ไร่ดี', f_citizen_id_card='1234567890122', f_tel='0887654321', f_address='456 หมู่ 2 ต.น้ำมัน อ.เกษตรสุข จ.สมุทรสงคราม',f_create_date=datetime.utcnow()-timedelta(days=20), f_modified_date=datetime.utcnow()-timedelta(days=2))
    ]
    food_industries = [
        FoodIndustry(F_id='C001', F_name='บริษัท น้ำมันพืชดีเด่น จำกัด', F_tel='021112222'),
        FoodIndustry(F_id='C002', F_name='โรงงานสบู่หอมไกล', F_tel='023334444')
    ]
    products = [
        Product(p_id='P001', p_name='ปาล์มทะลาย', price_per_unit=5.50),
        Product(p_id='P002', p_name='น้ำมันปาล์มดิบ', price_per_unit=35.0),
        Product(p_id='P003', p_name='เมล็ดในปาล์ม', price_per_unit=18.0)
    ]
    
    db.session.add_all(warehouses + employees + farmers + food_industries + products)
    db.session.commit()
    print("   - Basic data (Warehouses, Employees, Farmers, Customers, Products) created.")

    # --- Purchase Orders (with new tracking) ---
    try:
        # PO001: Completed Workflow
        po1 = PurchaseOrder(
            purchase_order_number='PO001', f_id='F001', b_date=datetime.utcnow()-timedelta(days=5),
            b_total_price=(5000*5.50 + 1000*18.0), 
            payment_status='Paid', stock_status='Completed',
            created_by_id='E005', created_date=datetime.utcnow()-timedelta(days=5, hours=2),
            paid_by_id='E003', paid_date=datetime.utcnow()-timedelta(days=4, hours=4),
            received_by_id='E004', received_date=datetime.utcnow()-timedelta(days=3, hours=6)
        )
        po1_items = [
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P001', quantity=5000, price_per_unit=5.50),
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P003', quantity=1000, price_per_unit=18.0)
        ]
        db.session.add(po1)
        db.session.add_all(po1_items)
        db.session.flush() # Needed to get po_item_id for StockTransactionIn

        # Simulate stock in for PO001
        stock_in1 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P001', in_quantity=5000, remaining_quantity=4000, unit_cost=5.50, warehouse_id='W001', po_item_id=po1_items[0].po_item_id)
        stock_in2 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P003', in_quantity=1000, remaining_quantity=1000, unit_cost=18.0, warehouse_id='W001', po_item_id=po1_items[1].po_item_id)
        db.session.add_all([stock_in1, stock_in2])
        db.session.add(StockLevel(p_id='P001', warehouse_id='W001', quantity=5000))
        db.session.add(StockLevel(p_id='P003', warehouse_id='W001', quantity=1000))


        # PO002: Paid, Pending Storage
        po2 = PurchaseOrder(
            purchase_order_number='PO002', f_id='F002', b_date=datetime.utcnow()-timedelta(days=2),
            b_total_price=(3000*5.60), 
            payment_status='Paid', stock_status='Pending',
            created_by_id='E005', created_date=datetime.utcnow()-timedelta(days=2, hours=1),
            paid_by_id='E003', paid_date=datetime.utcnow()-timedelta(days=1, hours=3)
        )
        po2_items = [PurchaseOrderItem(purchase_order_number='PO002', p_id='P001', quantity=3000, price_per_unit=5.60)]
        db.session.add(po2)
        db.session.add_all(po2_items)

        # PO003: Unpaid
        po3 = PurchaseOrder(
            purchase_order_number='PO003', f_id='F001', b_date=datetime.utcnow()-timedelta(days=1),
            b_total_price=(2000*5.40), 
            payment_status='Unpaid', stock_status='Not Received',
            created_by_id='E005', created_date=datetime.utcnow()-timedelta(days=1, hours=5)
        )
        po3_items = [PurchaseOrderItem(purchase_order_number='PO003', p_id='P001', quantity=2000, price_per_unit=5.40)]
        db.session.add(po3)
        db.session.add_all(po3_items)

        print("   - Example Purchase Orders seeded with tracking info.")
        db.session.commit()
    except Exception as e:
        print(f"Error seeding Purchase Orders: {e}")
        db.session.rollback()


    # --- Sales Orders (with tracking) ---
    try:
        # SO001: Completed Workflow
        so1 = SalesOrder(
            sale_order_number='SO001', F_id='C001', s_date=datetime.utcnow()-timedelta(days=2),
            s_total_price=(1000 * 8.0),
            shipment_status='Delivered', delivery_status='Delivered', payment_status='Paid',
            created_by_id='E002', created_date=datetime.utcnow()-timedelta(days=2, hours=2),
            shipped_by_id='E004', shipped_date=datetime.utcnow()-timedelta(days=1, hours=5),
            delivered_by_id='E002', delivered_date=datetime.utcnow()-timedelta(hours=10),
            paid_by_id='E003', paid_date=datetime.utcnow()-timedelta(hours=1)
        )
        so1_items = [SalesOrderItem(sale_order_number='SO001', p_id='P001', quantity=1000, price_per_unit=8.0)]
        db.session.add(so1)
        db.session.add_all(so1_items)

        # Simulate stock out for SO001
        stock_level1 = StockLevel.query.filter_by(p_id='P001', warehouse_id='W001').first()
        if stock_level1:
            stock_level1.quantity -= 1000
        
        print("   - Example Sales Order seeded.")
        db.session.commit()
    except Exception as e:
        print(f"Error seeding Sales Order: {e}")
        db.session.rollback()

    print("✅ Database seeding complete!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        clear_data()
        seed_data()