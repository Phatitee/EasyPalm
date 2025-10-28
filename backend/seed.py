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
    print("   - Basic data created.")

    # --- Seed Large Initial Stock ---
    try:
        print("   - Seeding initial large stock...")
        # PO001: Huge stock for P001 and P003 to ensure sales don't fail
        po1_date = datetime.utcnow() - timedelta(days=70)
        po1 = PurchaseOrder(
            purchase_order_number='PO001', f_id='F001', b_date=po1_date,
            b_total_price=(200000 * 5.50) + (50000 * 18.0), 
            payment_status='Paid', stock_status='Completed',
            created_by_id='E005', paid_by_id='E003', received_by_id='E004',
            created_date=po1_date, paid_date=po1_date + timedelta(days=1), received_date=po1_date + timedelta(days=2)
        )
        po1_items = [
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P001', quantity=200000, price_per_unit=5.50),
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P003', quantity=50000, price_per_unit=18.0)
        ]
        db.session.add(po1)
        db.session.add_all(po1_items)
        db.session.flush()

        # Stock In transactions for PO001
        stock_in1 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P001', in_quantity=200000, remaining_quantity=200000, unit_cost=5.50, warehouse_id='W001', po_item_id=po1_items[0].po_item_id)
        stock_in2 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P003', in_quantity=50000, remaining_quantity=50000, unit_cost=18.0, warehouse_id='W001', po_item_id=po1_items[1].po_item_id)
        db.session.add_all([stock_in1, stock_in2])

        # Initial Stock Levels
        db.session.add(StockLevel(p_id='P001', warehouse_id='W001', quantity=200000))
        db.session.add(StockLevel(p_id='P003', warehouse_id='W001', quantity=50000))

        # Add a second batch of P001 at a different price for COGS calculation testing
        po2_date = datetime.utcnow() - timedelta(days=40)
        po2 = PurchaseOrder(purchase_order_number='PO002', f_id='F002', b_date=po2_date, b_total_price=(100000 * 5.80), payment_status='Paid', stock_status='Completed', created_by_id='E005', paid_by_id='E003', received_by_id='E004', created_date=po2_date, paid_date=po2_date + timedelta(days=1), received_date=po2_date + timedelta(days=2))
        po2_items = [PurchaseOrderItem(purchase_order_number='PO002', p_id='P001', quantity=100000, price_per_unit=5.80)]
        db.session.add(po2)
        db.session.add_all(po2_items)
        db.session.flush()
        stock_in3 = StockTransactionIn(in_transaction_date=po2.received_date, p_id='P001', in_quantity=100000, remaining_quantity=100000, unit_cost=5.80, warehouse_id='W001', po_item_id=po2_items[0].po_item_id)
        db.session.add(stock_in3)
        
        stock_level_p001 = StockLevel.query.filter_by(p_id='P001', warehouse_id='W001').first()
        stock_level_p001.quantity += 100000
        
        db.session.commit()
        print("   - Initial stock seeded successfully.")
    except Exception as e:
        print(f"Error seeding initial stock: {e}")
        db.session.rollback()


    # --- Generate Sales Data for the last 60 days ---
    print("   - Generating 60 days of purchase and sales history...")
    try:
        # เริ่มตัวนับจากจำนวน purchase/sales ที่มีอยู่ใน DB เพื่อหลีกเลี่ยงการสร้างหมายเลขซ้ำ
        po_counter = PurchaseOrder.query.count() + 1
        so_counter = SalesOrder.query.count() + 1
        
        # Initialize stock levels
        for p in products:
            for w in warehouses:
                db.session.add(StockLevel(p_id=p.p_id, warehouse_id=w.warehouse_id, quantity=0))
        db.session.commit()

        for i in range(60):
            day = 59 - i
            current_date = datetime.utcnow() - timedelta(days=day)
            
            # --- Create 1 to 2 Purchase Orders per day ---
            for _ in range(random.randint(1, 2)):
                po_number = f'PO{po_counter:03d}'
                po_items_data = []
                total_price = 0
                
                # Add 1 to 2 products to the PO
                for _ in range(random.randint(1, 2)):
                    product = random.choice(products)
                    quantity = random.randint(5000, 20000)
                    price = round(product.price_per_unit * random.uniform(0.95, 1.05), 2)
                    po_items_data.append({'p_id': product.p_id, 'quantity': quantity, 'price_per_unit': price})
                    total_price += quantity * price

                # Create PO and its items
                po = PurchaseOrder(
                    purchase_order_number=po_number, f_id=random.choice(farmers).f_id, b_date=current_date,
                    b_total_price=total_price, payment_status='Paid', stock_status='Completed',
                    created_by_id='E005', paid_by_id='E003', received_by_id='E004',
                    created_date=current_date, paid_date=current_date, received_date=current_date
                )
                db.session.add(po)
                
                po_items = [PurchaseOrderItem(purchase_order_number=po_number, **item) for item in po_items_data]
                db.session.add_all(po_items)
                db.session.flush()

                # Process stock-in for this PO
                for item in po_items:
                    db.session.add(StockTransactionIn(
                        in_transaction_date=current_date, p_id=item.p_id, in_quantity=item.quantity,
                        remaining_quantity=item.quantity, unit_cost=item.price_per_unit,
                        warehouse_id='W001', po_item_id=item.po_item_id
                    ))
                    stock_level = StockLevel.query.filter_by(p_id=item.p_id, warehouse_id='W001').first()
                    stock_level.quantity += item.quantity
                
                po_counter += 1

            # --- Create 1 to 3 Sales Orders per day ---
            for _ in range(random.randint(1, 3)):
                so_number = f'SO{so_counter:03d}'
                product_to_sell = random.choice(products)
                
                # Ensure there is enough stock to sell
                stock_level = StockLevel.query.filter_by(p_id=product_to_sell.p_id, warehouse_id='W001').first()
                if not stock_level or stock_level.quantity < 500:
                    continue # Skip if not enough stock

                quantity = random.randint(100, min(1500, int(stock_level.quantity / 2))) # Sell up to half of available stock
                price = round(product_to_sell.price_per_unit * random.uniform(1.2, 1.5), 2)
                
                so = SalesOrder(
                    sale_order_number=so_number, F_id=random.choice(food_industries).F_id, s_date=current_date,
                    s_total_price=quantity * price, shipment_status='Delivered', delivery_status='Delivered', payment_status='Paid',
                    created_by_id='E002', shipped_by_id='E004', delivered_by_id='E002', paid_by_id='E003',
                    created_date=current_date, shipped_date=current_date, delivered_date=current_date, paid_date=current_date
                )
                db.session.add(so)

                so_item = SalesOrderItem(sale_order_number=so_number, p_id=product_to_sell.p_id, quantity=quantity, price_per_unit=price)
                db.session.add(so_item)
                db.session.flush()

                # FIFO COGS Calculation
                quantity_to_process, total_cogs = quantity, 0
                stock_lots = StockTransactionIn.query.filter(StockTransactionIn.p_id == product_to_sell.p_id, StockTransactionIn.warehouse_id == 'W001', StockTransactionIn.remaining_quantity > 0).order_by(StockTransactionIn.in_transaction_date.asc()).all()
                for lot in stock_lots:
                    if quantity_to_process <= 0: break
                    take_from_lot = min(quantity_to_process, lot.remaining_quantity)
                    total_cogs += take_from_lot * lot.unit_cost
                    lot.remaining_quantity -= take_from_lot
                    quantity_to_process -= take_from_lot
                
                db.session.add(SalesOrderItemCost(so_item_id=so_item.so_item_id, cogs=total_cogs))
                stock_level.quantity -= quantity
                so_counter += 1
        
        db.session.commit()
        print("   - History generation complete.")
    except Exception as e:
        print(f"Error generating history: {e}")
        db.session.rollback()

    print("✅ Database seeding complete!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        clear_data()
        seed_data()