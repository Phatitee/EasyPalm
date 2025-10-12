# backend/seed.py

from app import create_app, db
# เพิ่ม Employee เข้าไปใน import
from app.models import Farmer, Product, PurchaseOrder, SalesOrder, Employee
from datetime import datetime

def seed_data():
    """Function to clear existing data and add new sample data."""
    
    app = create_app()
    with app.app_context():
        print("กำลังลบข้อมูลทั้งหมด...")
        # ลบข้อมูลทั้งหมดออกจากทุกตาราง
        db.drop_all()
        
        print("กำลังสร้างตารางใหม่...")
        # สร้างโครงสร้างตารางทั้งหมดขึ้นมาใหม่ตาม Models
        db.create_all()

        print("กำลังเพิ่มข้อมูลตัวอย่าง...")

        # --- 1. สร้างข้อมูลพนักงาน (Employees) ---
        admin = Employee(
            e_id='E001',
            e_name='แอดมิน ใหญ่สุด',
            e_gender='Male',
            e_citizen_id_card='1111111111111',
            e_tel='0800000001',
            e_citizen_address='Admin Address',
            e_email='admin@easypalm.com',
            e_address='Admin Address',
            position='System Administrator',
            e_role='Admin',  # <--- Role: Admin
            username='admin',
            password='admin123' # ในระบบจริง รหัสผ่านควรถูกเข้ารหัส (Hashed)
        )
        
        sales_staff = Employee(
            e_id='E002',
            e_name='สมศรี ฝ่ายขาย',
            e_gender='Female',
            e_citizen_id_card='2222222222222',
            e_tel='0800000002',
            e_citizen_address='Sales Address',
            e_email='sales@easypalm.com',
            e_address='Sales Address',
            position='Sales Representative',
            e_role='Sales', # <--- Role: พนักงานฝ่ายซื้อ-ขาย
            username='sales',
            password='sales123'
        )

        finance_staff = Employee(
            e_id='E003',
            e_name='มานี การเงิน',
            e_gender='Female',
            e_citizen_id_card='3333333333333',
            e_tel='0800000003',
            e_citizen_address='Finance Address',
            e_email='finance@easypalm.com',
            e_address='Finance Address',
            position='Finance Officer',
            e_role='Finance', # <--- Role: พนักงานการเงิน
            username='finance',
            password='finance123'
        )
        
        # --- 2. สร้างข้อมูลเกษตรกร (Farmers) ---
        farmer1 = Farmer(f_id='F001', f_name='สมชาย เกษตรกร', f_citizen_id_card='1234567890123', f_tel='0812345678', f_address='กรุงเทพ')
        farmer2 = Farmer(f_id='F002', f_name='สมหญิง ทำสวน', f_citizen_id_card='9876543210987', f_tel='0898765432', f_address='เชียงใหม่')

        # --- 3. สร้างข้อมูลสินค้า (Products) ---
        product1 = Product(p_id='P001', p_name='ปาล์มทะลาย', price_per_unit=5.50, effective_date=datetime.utcnow())
        product2 = Product(p_id='P002', p_name='เมล็ดปาล์ม', price_per_unit=8.75, effective_date=datetime.utcnow())
        product3 = Product(p_id='P003', p_name='น้ำมันปาล์มดิบ', price_per_unit=35.20, effective_date=datetime.utcnow())

        # --- 4. สร้างข้อมูลการสั่งซื้อ/ขาย (Orders) ---
        po1 = PurchaseOrder(purchase_order_number='PO001', b_quantity=100, b_total_price=550.0, farmer=farmer1, product=product1)
        so1 = SalesOrder(sale_order_number='SO001', s_quantity=50, s_total_price=1760.0, farmer=farmer2, product=product3)

        # --- 5. เพิ่มข้อมูลทั้งหมดลงใน session ---
        db.session.add_all([
            admin, sales_staff, finance_staff, # เพิ่มพนักงาน
            farmer1, farmer2, 
            product1, product2, product3, 
            po1, so1
        ])
        
        # --- 6. บันทึกข้อมูลลงฐานข้อมูลจริง ---
        db.session.commit()
        
        print("เพิ่มข้อมูลตัวอย่างสำเร็จ!")
        print("--- User Accounts ---")
        print("Admin: username='admin', password='admin123'")
        print("Sales: username='sales', password='sales123'")
        print("Finance: username='finance', password='finance123'")

if __name__ == '__main__':
    seed_data()