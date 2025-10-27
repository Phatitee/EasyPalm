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
        Warehouse(warehouse_id='W001', warehouse_name='คลังสินค้าหลัก', location='สำนักงานใหญ่'),
        Warehouse(warehouse_id='W002', warehouse_name='คลังสินค้าย่อย', location='สาขาย่อย 1')
    ]
    db.session.add_all(warehouses)
    print("   - Warehouses created.")

    # --- 2. Employees ---
    employees = [
    Employee(e_id='E001', e_name='แอดมิน ใหญ่สุด', e_gender='Male', e_citizen_id_card='1111111111111', e_tel='0800000001', e_citizen_address='Admin Address', e_email='admin@easypalm.com', e_address='Admin Address', position='System Administrator', e_role=EmployeeRole.ADMIN, username='admin', password='123'),
    Employee(e_id='E002', e_name='สมศรี ฝ่ายขาย', e_gender='Female', e_citizen_id_card='2222222222222', e_tel='0800000002', e_citizen_address='Sales Address', e_email='sales@easypalm.com', e_address='Sales Address', position='Sales Representative', e_role=EmployeeRole.SALES, username='sales', password='123'),
    Employee(e_id='E003', e_name='มานี การเงิน', e_gender='Female', e_citizen_id_card='3333333333333', e_tel='0800000003', e_citizen_address='Finance Address', e_email='finance@easypalm.com', e_address='Finance Address', position='Finance Officer', e_role=EmployeeRole.ACCOUNTANT, username='accountant', password='123'),
    Employee(e_id='E004', e_name='สมศักดิ์ คลังใหญ่', e_gender='Female', e_citizen_id_card='444444444444', e_tel='0800000004', e_citizen_address='Warehouse Officer', e_email='Warehouse@easypalm.com', e_address='Warehouse Officer', position='Warehouse Officer', e_role=EmployeeRole.WAREHOUSE, username='warehouse', password='123'),
    Employee(e_id='E005', e_name='สุดา บัญชี', e_gender='Female', e_citizen_id_card='5555555555555', e_tel='0800000005', e_citizen_address='purchasing Address', e_email ='purchasing@easyplam.com', e_address='purchasing Address', position='purchasing Officer', e_role=EmployeeRole.PURCHASING, username='purchasing', password='123'),
    Employee(e_id='E006', e_name='วิรัช ผู้บริหาร', e_gender='Male', e_citizen_id_card='6666666666666', e_tel='0800000006', e_citizen_address='Executive Address',e_email = 'executive@easyplam.com', e_address='Executive Address', position='Executive Officer', e_role=EmployeeRole.EXECUTIVE, username='executive', password='123')
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
        Product(p_id='P001', p_name='ปาล์มทะลาย', p_unit=18.0, price_per_unit=25.0, effective_date=datetime.utcnow() - timedelta(days=10)),
        Product(p_id='P002', p_name='น้ำมันปาล์มบริสุทธิ์', p_unit=18.0, price_per_unit=30.0, effective_date=datetime.utcnow() - timedelta(days=5)),
        Product(p_id='P003', p_name='เมล็ดปาล์ม', p_unit=50.0, price_per_unit=10.0, effective_date=datetime.utcnow() - timedelta(days=20))
    ]
       
    
    db.session.add_all(products)
    print("   - Products created.")

    db.session.commit()
    print("✅ Basic data seeded successfully!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # The correct order is to clear first, then seed.
        clear_data()
        seed_data()