# backend/seed.py
from app import create_app, db
from app.models import (
    Employee, Farmer, FoodIndustry, Product, Warehouse,
    PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem,
    StockLevel, StockTransactionIn, StockTransactionOut, SalesOrderItemCost, StockTransactionReturn,EmployeeRole)
from datetime import datetime, timedelta
import random

def clear_data():
    """Deletes all data from the tables in the correct order."""
    # Delete records that have foreign key dependencies first
    db.session.query(SalesOrderItemCost).delete()
    db.session.query(StockTransactionReturn).delete() # Added StockTransactionReturn
    db.session.query(StockTransactionIn).delete()
    db.session.query(StockTransactionOut).delete()
    db.session.query(SalesOrderItem).delete()
    db.session.query(PurchaseOrderItem).delete()
    db.session.query(StockLevel).delete()
    db.session.query(SalesOrder).delete()
    db.session.query(PurchaseOrder).delete()

    # Now delete the primary records
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

    # --- 1. Warehouses ---
    warehouses = [
        Warehouse(warehouse_id='W001', warehouse_name='คลังสินค้าหลัก', location='สำนักงานใหญ่', capacity=500000.0),
        Warehouse(warehouse_id='W002', warehouse_name='คลังสินค้าย่อย', location='สาขาย่อย 1', capacity=100000.0)
    ]
    db.session.add_all(warehouses)
    print("   - Warehouses created.")

    # --- 2. Employees ---
    employees = [
        Employee(e_id='E001', e_name='แอดมิน ใหญ่สุด', e_gender='Male', e_citizen_id_card='1111111111111', e_tel='0800000001', e_citizen_address='Admin Address', e_email='admin@easypalm.com', e_address='Admin Address', position='System Administrator', e_role=EmployeeRole.ADMIN, username='admin', password='123', is_active=True),
        Employee(e_id='E002', e_name='สมศรี ฝ่ายขาย', e_gender='Female', e_citizen_id_card='2222222222222', e_tel='0800000002', e_citizen_address='Sales Address', e_email='sales@easypalm.com', e_address='Sales Address', position='Sales Representative', e_role=EmployeeRole.SALES, username='sales', password='123', is_active=True),
        Employee(e_id='E003', e_name='มานี การเงิน', e_gender='Female', e_citizen_id_card='3333333333333', e_tel='0800000003', e_citizen_address='Finance Address', e_email='finance@easypalm.com', e_address='Finance Address', position='Finance Officer', e_role=EmployeeRole.ACCOUNTANT, username='accountant', password='123', is_active=True),
        Employee(e_id='E004', e_name='สมศักดิ์ คลังใหญ่', e_gender='Male', e_citizen_id_card='4444444444444', e_tel='0800000004', e_citizen_address='Warehouse Address', e_email='warehouse@easypalm.com', e_address='Warehouse Address', position='Warehouse Officer', e_role=EmployeeRole.WAREHOUSE, username='warehouse', password='123', is_active=True),
        Employee(e_id='E005', e_name='สุดา จัดซื้อ', e_gender='Female', e_citizen_id_card='5555555555555', e_tel='0800000005', e_citizen_address='Purchasing Address', e_email ='purchasing@easypalm.com', e_address='Purchasing Address', position='Purchasing Officer', e_role=EmployeeRole.PURCHASING, username='purchasing', password='123', is_active=True),
        Employee(e_id='E006', e_name='วิรัช ผู้บริหาร', e_gender='Male', e_citizen_id_card='6666666666666', e_tel='0800000006', e_citizen_address='Executive Address',e_email = 'executive@easypalm.com', e_address='Executive Address', position='Executive Officer', e_role=EmployeeRole.EXECUTIVE, username='executive', password='123', is_active=True),
        Employee(e_id='E007', e_name='มานะ ไม่ใช้งาน', e_gender='Male', e_citizen_id_card='7777777777777', e_tel='0800000007', e_citizen_address='Suspended Address',e_email = 'inactive@easypalm.com', e_address='Suspended Address', position='Former Employee', e_role=EmployeeRole.SALES, username='inactive', password='123', is_active=False, suspension_date=datetime.utcnow() - timedelta(days=5)) # Example of inactive user
    ]

    db.session.add_all(employees)
    print("   - Employees created.")

    # --- 3. Farmers ---
    farmers = [
        Farmer(f_id='F001', f_name='สมชาย สวนปาล์ม', f_citizen_id_card='3333333333333', f_tel='0812345678', f_address='123 หมู่ 1 ต.ปาล์ม อ.เมือง จ.กระบี่'),
        Farmer(f_id='F002', f_name='สมศรี ไร่ดี', f_citizen_id_card='4444444444444', f_tel='0887654321', f_address='456 หมู่ 2 ต.อ่าวลึก อ.อ่าวลึก จ.กระบี่')
    ]
    db.session.add_all(farmers)
    print("   - Farmers created.")

    # --- 4. Food Industries (Customers) ---
    food_industries = [
        FoodIndustry(F_id='C001', F_name='บริษัท น้ำมันพืชดีเด่น จำกัด', F_tel='021112222', F_address='นิคมอุตสาหกรรมบางปู'),
        FoodIndustry(F_id='C002', F_name='โรงงานสบู่หอมไกล', F_tel='023334444', F_address='นิคมอุตสาหกรรมลาดกระบัง')
    ]
    db.session.add_all(food_industries)
    print("   - Food Industries created.")

    # --- 5. Products ---
    products = [
        Product(p_id='P001', p_name='ปาล์มทะลาย', p_unit=1.0, price_per_unit=5.50, effective_date=datetime.utcnow() - timedelta(days=10)),
        Product(p_id='P002', p_name='น้ำมันปาล์มดิบ', p_unit=1.0, price_per_unit=35.0, effective_date=datetime.utcnow() - timedelta(days=5)),
        Product(p_id='P003', p_name='เมล็ดในปาล์ม', p_unit=1.0, price_per_unit=18.0, effective_date=datetime.utcnow() - timedelta(days=20))
    ]


    db.session.add_all(products)
    print("   - Products created.")

    # --- 6. Example Purchase Orders & Stock ---
    try:
        po1_items = [
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P001', quantity=5000, price_per_unit=5.50),
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P003', quantity=1000, price_per_unit=18.0)
        ]
        po1 = PurchaseOrder(purchase_order_number='PO001', f_id='F001', b_date=datetime.utcnow()-timedelta(days=3),
                            b_total_price=(5000*5.50 + 1000*18.0), payment_status='Paid', stock_status='Completed')
        db.session.add(po1)
        db.session.add_all(po1_items)
        db.session.flush() # Ensure items get IDs before creating stock transactions

        stock_in1 = StockTransactionIn(in_transaction_date=po1.b_date, p_id='P001', in_quantity=5000, remaining_quantity=5000, unit_cost=5.50, warehouse_id='W001', po_item_id=po1_items[0].po_item_id)
        stock_in2 = StockTransactionIn(in_transaction_date=po1.b_date, p_id='P003', in_quantity=1000, remaining_quantity=1000, unit_cost=18.0, warehouse_id='W001', po_item_id=po1_items[1].po_item_id)
        stock_level1 = StockLevel(p_id='P001', warehouse_id='W001', quantity=5000)
        stock_level2 = StockLevel(p_id='P003', warehouse_id='W001', quantity=1000)
        db.session.add_all([stock_in1, stock_in2, stock_level1, stock_level2])

        po2_items = [PurchaseOrderItem(purchase_order_number='PO002', p_id='P001', quantity=3000, price_per_unit=5.60)]
        po2 = PurchaseOrder(purchase_order_number='PO002', f_id='F002', b_date=datetime.utcnow()-timedelta(days=2),
                            b_total_price=(3000*5.60), payment_status='Paid', stock_status='Pending') # Example pending stock
        db.session.add(po2)
        db.session.add_all(po2_items)

        po3_items = [PurchaseOrderItem(purchase_order_number='PO003', p_id='P001', quantity=2000, price_per_unit=5.40)]
        po3 = PurchaseOrder(purchase_order_number='PO003', f_id='F001', b_date=datetime.utcnow()-timedelta(days=1),
                            b_total_price=(2000*5.40), payment_status='Unpaid', stock_status='Pending') # Example unpaid
        db.session.add(po3)
        db.session.add_all(po3_items)

        print("   - Example Purchase Orders and Stock seeded.")
    except Exception as e:
        print(f"Error seeding PO/Stock: {e}")
        db.session.rollback()


    db.session.commit()
    print("✅ Basic data seeded successfully!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # The correct order is to clear first, then seed.
        clear_data()
        seed_data()
