# backend/seed.py
from app import create_app, db
# Import Models ทั้งหมดที่จำเป็น
from app.models import (
    Farmer, Product, PurchaseOrder, SalesOrder, Employee, 
    PurchaseOrderItem, Warehouse, StockLevel, SalesOrderItem,
    FoodIndustry # <--- เพิ่ม FoodIndustry เข้ามา
)
from datetime import datetime

def seed_data():
    """ล้างและเพิ่มข้อมูลตัวอย่างใหม่ทั้งหมด"""

    app = create_app()
    with app.app_context():
        print("กำลังลบข้อมูลทั้งหมด...")
        # ต้องมั่นใจว่าทุกโมเดลถูก Import ก่อนเรียก db.drop_all()
        db.drop_all() 

        print("กำลังสร้างตารางใหม่...")
        db.create_all()

        print("กำลังเพิ่มข้อมูลตัวอย่าง...")

        # --- สร้างข้อมูลพนักงาน ---
        admin = Employee(e_id='E001', e_name='แอดมิน ใหญ่สุด', e_gender='Male', e_citizen_id_card='1111111111111', e_tel='0800000001', e_citizen_address='Admin Address', e_email='admin@easypalm.com', e_address='Admin Address', position='System Administrator', e_role='Admin', username='admin', password='admin123')
        sales_staff = Employee(e_id='E002', e_name='สมศรี ฝ่ายขาย', e_gender='Female', e_citizen_id_card='2222222222222', e_tel='0800000002', e_citizen_address='Sales Address', e_email='sales@easypalm.com', e_address='Sales Address', position='Sales Representative', e_role='Sales', username='sales', password='sales123')
        finance_staff = Employee(e_id='E003', e_name='มานี การเงิน', e_gender='Female', e_citizen_id_card='3333333333333', e_tel='0800000003', e_citizen_address='Finance Address', e_email='finance@easypalm.com', e_address='Finance Address', position='Finance Officer', e_role='Finance', username='finance', password='finance123')

        # --- สร้างข้อมูลเกษตรกร ---
        farmer1 = Farmer(f_id='F001', f_name='สมชาย เกษตรกร', f_citizen_id_card='1234567890123', f_tel='0812345678', f_address='กรุงเทพ')
        farmer2 = Farmer(f_id='F002', f_name='สมหญิง ทำสวน', f_citizen_id_card='9876543210987', f_tel='0898765432', f_address='เชียงใหม่')

        # --- สร้างข้อมูลโรงงานลูกค้า (Food Industry) ---
        industry1 = FoodIndustry(F_id='I001', F_name='โรงงานปาล์มรุ่งเรือง', F_tel='021112222', F_address='อยุธยา')
        industry2 = FoodIndustry(F_id='I002', F_name='โรงงานน้ำมันดี', F_tel='023334444', F_address='ชลบุรี')

        # --- สร้างข้อมูลสินค้า ---
        product1 = Product(p_id='P001', p_name='ปาล์มทะลาย', price_per_unit=5.50, effective_date=datetime.utcnow())
        product2 = Product(p_id='P002', p_name='เมล็ดปาล์ม', price_per_unit=8.75, effective_date=datetime.utcnow())
        product3 = Product(p_id='P003', p_name='น้ำมันปาล์มดิบ', price_per_unit=35.20, effective_date=datetime.utcnow())

        # --- สร้างข้อมูลคลังสินค้า ---
        warehouse1 = Warehouse(warehouse_id='W001', warehouse_name='คลังหลัก', location='อาคาร A')

        # --- สร้างข้อมูลสต็อกเริ่มต้น (StockLevel) ---
        # ต้องมีสต็อกสำหรับสินค้า P003 ก่อนจึงจะขายได้
        stock1 = StockLevel(p_id='P001', warehouse_id='W001', quantity=1000)
        stock2 = StockLevel(p_id='P002', warehouse_id='W001', quantity=500)
        stock3 = StockLevel(p_id='P003', warehouse_id='W001', quantity=200) # มีสต็อก 200 หน่วย

        # --- สร้างข้อมูลการสั่งซื้อ (Purchase Order) ---
        po1 = PurchaseOrder(purchase_order_number='PO001', f_id='F001', b_total_price=925.0, payment_status='Unpaid', b_date=datetime.utcnow())
        item1_po1 = PurchaseOrderItem(purchase_order_number='PO001', p_id='P001', quantity=100, price_per_unit=5.50)
        item2_po1 = PurchaseOrderItem(purchase_order_number='PO001', p_id='P002', quantity=50, price_per_unit=7.50)

        # --- สร้างข้อมูลการขาย (Sales Order) ---
        # ขาย P003 จำนวน 150 หน่วย (มีสต็อก 200 หน่วย)
        so1 = SalesOrder(sale_order_number='SO001', food_industry_id='I001', s_total_price=5280.0, s_date=datetime.utcnow())
        item1_so1 = SalesOrderItem(sale_order_number='SO002', p_id='P003', quantity=150, price_per_unit=35.20)
        # Note: การบันทึก SalesOrder ใน Backend Routes ที่คุณแก้ไขก่อนหน้านี้ จะทำการลด StockLevel ของ P003 ลง 150 หน่วย

        db.session.add_all([
            admin, sales_staff, finance_staff,
            farmer1, farmer2,
            industry1, industry2, # <--- เพิ่ม Food Industry
            product1, product2, product3,
            warehouse1, 
            stock1, stock2, stock3, 
            po1, item1_po1, item2_po1,
            so1, item1_so1 # <--- เพิ่ม Sales Order
        ])

        db.session.commit()

        print("เพิ่มข้อมูลตัวอย่างสำเร็จ!")
        print("--- User Accounts ---")
        print("Admin: username='admin', password='admin123'")
        print("Sales: username='sales', password='sales123'")
        print("Finance: username='finance', password='finance123'")

if __name__ == '__main__':
    seed_data()