# backend/seed.py
from app import create_app, db
from app.models import (
    Employee, Farmer, FoodIndustry, Product, Warehouse,
    PurchaseOrder, PurchaseOrderItem, SalesOrder, SalesOrderItem,
    StockLevel, StockTransactionIn, StockTransactionOut, SalesOrderItemCost,
    StockTransactionReturn, EmployeeRole)
from datetime import datetime, timedelta
import random
from sqlalchemy.exc import IntegrityError

def clear_data():
    """Deletes all data from the tables in the correct order."""
    print("🧹 Clearing all existing data from the database...")
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
    print("✅ All existing data has been cleared successfully.")

def seed_base_data():
    """Seeds the database with foundational data like users, products, etc."""
    print("🌱 Starting to seed foundational data...")

    # --- Warehouses ---
    warehouses = [
        Warehouse(warehouse_id='W001', warehouse_name='คลังสินค้าหลัก (สมุทรสงคราม)', location='สำนักงานใหญ่', capacity=500000.0),
        Warehouse(warehouse_id='W002', warehouse_name='คลังสินค้าย่อย (ราชบุรี)', location='สาขาย่อย 1', capacity=100000.0)
    ]

    # --- Employees ---
    employees = [
        Employee(e_id='E001', e_name='แอดมิน ใหญ่สุด', e_gender='Male', e_citizen_id_card='1111111111111', e_tel='0800000001', position='System Administrator', e_role=EmployeeRole.ADMIN, username='admin', password='123', is_active=True),
        Employee(e_id='E002', e_name='สมศรี ฝ่ายขาย', e_gender='Female', e_citizen_id_card='2222222222222', e_tel='0800000002', position='Sales Representative', e_role=EmployeeRole.SALES, username='sales', password='123', is_active=True),
        Employee(e_id='E003', e_name='มานี การเงิน', e_gender='Female', e_citizen_id_card='3333333333333', e_tel='0800000003', position='Accountant', e_role=EmployeeRole.ACCOUNTANT, username='accountant', password='123', is_active=True),
        Employee(e_id='E004', e_name='สมศักดิ์ คลังใหญ่', e_gender='Male', e_citizen_id_card='4444444444444', e_tel='0800000004', position='Warehouse Manager', e_role=EmployeeRole.WAREHOUSE, username='warehouse', password='123', is_active=True),
        Employee(e_id='E005', e_name='สุดา จัดซื้อ', e_gender='Female', e_citizen_id_card='5555555555555', e_tel='0800000005', position='Purchasing Officer', e_role=EmployeeRole.PURCHASING, username='purchasing', password='123', is_active=True),
        Employee(e_id='E006', e_name='วิรัช ผู้บริหาร', e_gender='Male', e_citizen_id_card='6666666666666', e_tel='0800000006', position='Executive', e_role=EmployeeRole.EXECUTIVE, username='executive', password='123', is_active=True),
        Employee(e_id='E007', e_name='มานะ ไม่ใช้งาน', e_gender='Male', e_citizen_id_card='7777777777777', e_tel='0800000007', position='Former Employee', e_role=EmployeeRole.SALES, username='inactive', password='123', is_active=False, suspension_date=datetime.utcnow() - timedelta(days=5))
    ]

    # --- Farmers (20 คน: ชื่อจริง) ---
    farmer_names = [
        'สมชาย สวนปาล์ม', 'สมศรี ไร่ดี', 'มานพ เกษตรดี', 'สุดา สวนทอง', 'วิรัช ปาล์มงาม',
        'มานะ สวนสด', 'สมบัติ ไร่สุข', 'สุรีย์ สวนเขียว', 'สมจิตร ปาล์มใหญ่', 'สุดใจ ไร่รุ่ง',
        'สมฤดี สวนสวย', 'สมพร ไร่ผลดี', 'สุดใจ สวนปาล์ม', 'สมบูรณ์ ไร่ปาล์ม', 'สุดขวัญ สวนดี',
        'สมศักดิ์ ไร่เขียว', 'สุดใจ สวนทอง', 'สมหมาย ไร่ปาล์ม', 'สุดา สวนสด', 'สมศรี ไร่รุ่ง'
    ]
    farmers = []
    for i, name in enumerate(farmer_names, 1):
        farmers.append(Farmer(
            f_id=f'F{i:03d}',
            f_name=name,
            f_citizen_id_card=f'{1000000000000 + i:013d}',
            f_tel=f'08{str(10000000 + i).zfill(8)}',
            f_address=f'{i*10} หมู่ {i%10+1} ต.ปาล์ม อ.เกษตรสุข จ.สมุทรสงคราม'
        ))

    # --- FoodIndustry (10 โรงงาน: ชื่อจริง) ---
    industry_names = [
        'บริษัท น้ำมันพืชดีเด่น จำกัด', 'โรงงานสบู่หอมไกล', 'บริษัท น้ำมันปาล์มไทย', 'โรงงานอาหารสัตว์รุ่งเรือง',
        'บริษัท ผลิตภัณฑ์ปาล์มไทย', 'โรงงานน้ำมันพืชสมุทร', 'บริษัท อุตสาหกรรมปาล์มทอง', 'โรงงานผลิตไบโอดีเซล',
        'บริษัท น้ำมันพืชสมบูรณ์', 'โรงงานผลิตสบู่ไทย'
    ]
    food_industries = []
    for i, name in enumerate(industry_names, 1):
        food_industries.append(FoodIndustry(
            F_id=f'C{i:03d}',
            F_name=name,
            F_tel=f'02{str(11110000 + i).zfill(8)}',
            F_address=f'อำเภออุตสาหกรรม {i} จังหวัดสมุทรปราการ'
        ))

    # --- Products (★★★ REMOVED p_unit ★★★) ---
    products = [
        Product(p_id='P001', p_name='ปาล์มทะลาย', price_per_unit=5.50),
        Product(p_id='P002', p_name='น้ำมันปาล์มดิบ', price_per_unit=35.0),
        Product(p_id='P003', p_name='เมล็ดในปาล์ม', price_per_unit=18.0)
    ]

    db.session.add_all(warehouses + employees + farmers + food_industries + products)
    db.session.commit()
    print("   - ✅ Warehouses, Employees, Farmers, Customers, and Products created.")


def seed_initial_stock():
    """Seeds the database with a large initial stock to ensure sales can be made."""
    print("📦 Seeding initial large stock...")
    try:
        # Initial Stock Levels for all products in all warehouses
        products = Product.query.all()
        warehouses = Warehouse.query.all()
        # สุ่มจำนวนสินค้าเริ่มต้นแต่ละคลัง โดยรวมทุกสินค้าไม่เกิน capacity
        for w in warehouses:
            remaining_capacity = w.capacity
            product_qtys = []
            for i, p in enumerate(products):
                if i == len(products) - 1:
                    qty = max(0, int(remaining_capacity))
                else:
                    max_qty = int(remaining_capacity // (len(products) - i))
                    qty = random.randint(int(max_qty*0.3), max_qty)
                product_qtys.append(qty)
                remaining_capacity -= qty
            for p, qty in zip(products, product_qtys):
                existing_stock = StockLevel.query.filter_by(p_id=p.p_id, warehouse_id=w.warehouse_id).first()
                if not existing_stock:
                    db.session.add(StockLevel(p_id=p.p_id, warehouse_id=w.warehouse_id, quantity=qty))
        db.session.commit()
        print("   - ✅ Initial stock seeded successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"   - ❌ Error seeding initial stock: {e}")

def seed_transaction_history():
    """Generates 5 months (150 days) of realistic purchase and sales history with all workflow stages."""
    print("🗓️ Generating 5 months (150 days) of realistic transaction history...")
    try:
        products = Product.query.all()
        farmers = Farmer.query.all()
        food_industries = FoodIndustry.query.all()
        warehouses = Warehouse.query.all()
        employees = Employee.query.all()

        # เลือกผู้ใช้แต่ละ role
        purchasing_users = [e for e in employees if e.e_role == EmployeeRole.PURCHASING]
        warehouse_users = [e for e in employees if e.e_role == EmployeeRole.WAREHOUSE]
        sales_users = [e for e in employees if e.e_role == EmployeeRole.SALES]
        accountant_users = [e for e in employees if e.e_role == EmployeeRole.ACCOUNTANT]

        # Start counters
        last_po = PurchaseOrder.query.order_by(PurchaseOrder.purchase_order_number.desc()).first()
        po_counter = int(last_po.purchase_order_number[2:]) + 1 if last_po else 1

        last_so = SalesOrder.query.order_by(SalesOrder.sale_order_number.desc()).first()
        so_counter = int(last_so.sale_order_number[2:]) + 1 if last_so else 1

        for i in range(149, -1, -1):  # 150 days
            current_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            print(f"   - Processing day {150-i}/150: {current_date.strftime('%Y-%m-%d')}...")

            # --- PURCHASE ORDERS: สร้าง 2-4 PO ต่อวัน ---
            for _ in range(random.randint(2, 4)):
                po_number = f'PO{po_counter:03d}'
                chosen_warehouse = random.choice(warehouses)
                created_by = random.choice(purchasing_users) if purchasing_users else None
                
                # สถานะต่างๆ ขึ้นกับอายุของ PO
                days_old = i
                if days_old <= 2:  # PO ล่าสุด อาจยังไม่จบทุกขั้นตอน
                    payment_status = random.choice(['Unpaid', 'Paid'])
                    stock_status = random.choice(['Not Received', 'Pending']) if payment_status == 'Paid' else 'Not Received'
                elif days_old <= 5:  # PO ที่ค่อนข้างใหม่
                    payment_status = random.choice(['Paid', 'Paid', 'Unpaid'])
                    stock_status = random.choice(['Pending', 'Completed']) if payment_status == 'Paid' else 'Not Received'
                else:  # PO เก่า ส่วนใหญ่ควรเสร็จสมบูรณ์
                    payment_status = 'Paid'
                    stock_status = 'Completed'

                # กำหนด timestamps ตามลำดับของ workflow
                created_date = current_date + timedelta(hours=random.randint(8, 10))
                paid_date = None
                received_date = None
                paid_by = None
                received_by = None

                if payment_status == 'Paid':
                    paid_by = random.choice(accountant_users) if accountant_users else None
                    paid_date = created_date + timedelta(hours=random.randint(2, 48))
                    
                    if stock_status == 'Pending':
                        received_by = random.choice(warehouse_users) if warehouse_users else None
                        # ยังไม่ได้รับของ
                    elif stock_status == 'Completed':
                        received_by = random.choice(warehouse_users) if warehouse_users else None
                        received_date = paid_date + timedelta(hours=random.randint(4, 72))

                po = PurchaseOrder(
                    purchase_order_number=po_number,
                    f_id=random.choice(farmers).f_id,
                    b_date=current_date,
                    payment_status=payment_status,
                    stock_status=stock_status,
                    created_by_id=created_by.e_id if created_by else None,
                    paid_by_id=paid_by.e_id if paid_by else None,
                    received_by_id=received_by.e_id if received_by else None,
                    created_date=created_date,
                    paid_date=paid_date,
                    received_date=received_date
                )

                # สร้าง PO Items
                total_price = 0
                num_items = random.randint(1, 3)
                selected_products = random.sample(products, min(num_items, len(products)))
                
                for product in selected_products:
                    quantity = random.randint(500, 5000)
                    price = round(product.price_per_unit * random.uniform(0.9, 1.1), 2)
                    total_price += quantity * price

                    po_item = PurchaseOrderItem(
                        purchase_order_number=po_number,
                        p_id=product.p_id,
                        quantity=quantity,
                        price_per_unit=price
                    )
                    db.session.add(po_item)
                    db.session.flush()

                    # สร้าง Stock Transaction In เฉพาะเมื่อรับของเข้าคลังแล้ว
                    if stock_status == 'Completed' and received_date:
                        stock_level = StockLevel.query.filter_by(
                            p_id=product.p_id, 
                            warehouse_id=chosen_warehouse.warehouse_id
                        ).first()
                        
                        if stock_level:
                            stock_level.quantity += quantity
                        else:
                            new_stock = StockLevel(
                                p_id=product.p_id,
                                warehouse_id=chosen_warehouse.warehouse_id,
                                quantity=quantity
                            )
                            db.session.add(new_stock)

                        db.session.add(StockTransactionIn(
                            in_transaction_date=received_date,
                            p_id=product.p_id,
                            in_quantity=quantity,
                            remaining_quantity=quantity,
                            unit_cost=price,
                            warehouse_id=chosen_warehouse.warehouse_id,
                            po_item_id=po_item.po_item_id
                        ))

                po.b_total_price = total_price
                db.session.add(po)
                po_counter += 1

            # --- SALES ORDERS: สร้าง 2-5 SO ต่อวัน ---
            for _ in range(random.randint(2, 5)):
                so_number = f'SO{so_counter:03d}'
                customer = random.choice(food_industries)
                chosen_warehouse = random.choice(warehouses)
                
                # เลือกสินค้าที่มีในสต็อก
                available_products = []
                for p in products:
                    stock = StockLevel.query.filter_by(
                        p_id=p.p_id,
                        warehouse_id=chosen_warehouse.warehouse_id
                    ).first()
                    if stock and stock.quantity >= 100:
                        available_products.append((p, stock))
                
                if not available_products:
                    continue

                # สถานะต่างๆ ตามอายุของ SO
                days_old = i
                created_by = random.choice(sales_users) if sales_users else None
                
                if days_old <= 1:  # SO ใหม่สุด
                    shipment_status = random.choice(['Pending', 'Shipped'])
                    delivery_status = 'Not Delivered'
                    payment_status = 'Unpaid'
                elif days_old <= 3:
                    shipment_status = random.choice(['Shipped', 'Delivered'])
                    delivery_status = random.choice(['Not Delivered', 'Delivered']) if shipment_status == 'Shipped' else 'Delivered'
                    payment_status = random.choice(['Unpaid', 'Paid']) if delivery_status == 'Delivered' else 'Unpaid'
                else:
                    shipment_status = 'Delivered'
                    delivery_status = 'Delivered'
                    payment_status = 'Paid'

                # กำหนด timestamps
                created_date = current_date + timedelta(hours=random.randint(9, 16))
                shipped_date = None
                delivered_date = None
                paid_date = None
                shipped_by = None
                delivered_by = None
                paid_by = None

                if shipment_status in ['Shipped', 'Delivered']:
                    shipped_by = random.choice(warehouse_users) if warehouse_users else None
                    shipped_date = created_date + timedelta(hours=random.randint(4, 24))

                if delivery_status == 'Delivered':
                    delivered_by = random.choice(sales_users) if sales_users else None
                    delivered_date = shipped_date + timedelta(hours=random.randint(2, 48)) if shipped_date else created_date + timedelta(hours=24)

                if payment_status == 'Paid':
                    paid_by = random.choice(accountant_users) if accountant_users else None
                    paid_date = delivered_date + timedelta(hours=random.randint(1, 72)) if delivered_date else created_date + timedelta(hours=48)

                # สร้าง SO Items
                num_items = random.randint(1, min(3, len(available_products)))
                selected_items = random.sample(available_products, num_items)
                
                total_price = 0
                so_items = []

                for product, stock in selected_items:
                    max_qty = min(2000, int(stock.quantity * 0.3))
                    if max_qty < 100:
                        continue
                    
                    quantity = random.randint(100, max_qty)
                    price = round(product.price_per_unit * random.uniform(1.15, 1.45), 2)
                    total_price += quantity * price

                    so_item = SalesOrderItem(
                        sale_order_number=so_number,
                        p_id=product.p_id,
                        quantity=quantity,
                        price_per_unit=price
                    )
                    db.session.add(so_item)
                    so_items.append((so_item, product, quantity))

                if not so_items:
                    continue

                so = SalesOrder(
                    sale_order_number=so_number,
                    F_id=customer.F_id,
                    s_date=current_date,
                    s_total_price=total_price,
                    shipment_status=shipment_status,
                    delivery_status=delivery_status,
                    payment_status=payment_status,
                    warehouse_id=chosen_warehouse.warehouse_id,
                    created_by_id=created_by.e_id if created_by else None,
                    shipped_by_id=shipped_by.e_id if shipped_by else None,
                    delivered_by_id=delivered_by.e_id if delivered_by else None,
                    paid_by_id=paid_by.e_id if paid_by else None,
                    created_date=created_date,
                    shipped_date=shipped_date,
                    delivered_date=delivered_date,
                    paid_date=paid_date
                )
                db.session.add(so)
                db.session.flush()

                # ประมวลผล FIFO และสร้าง transactions เฉพาะเมื่อจัดส่งแล้ว
                if shipment_status in ['Shipped', 'Delivered'] and shipped_date:
                    for so_item, product, quantity in so_items:
                        quantity_to_process = quantity
                        total_cogs = 0

                        # FIFO
                        stock_lots = StockTransactionIn.query.filter(
                            StockTransactionIn.p_id == product.p_id,
                            StockTransactionIn.warehouse_id == chosen_warehouse.warehouse_id,
                            StockTransactionIn.remaining_quantity > 0
                        ).order_by(StockTransactionIn.in_transaction_date.asc()).all()

                        for lot in stock_lots:
                            if quantity_to_process <= 0:
                                break
                            
                            take_qty = min(quantity_to_process, lot.remaining_quantity)
                            total_cogs += take_qty * lot.unit_cost
                            lot.remaining_quantity -= take_qty
                            quantity_to_process -= take_qty

                        # สร้าง COGS และ Stock Out
                        db.session.add(SalesOrderItemCost(
                            so_item_id=so_item.so_item_id,
                            cogs=total_cogs
                        ))

                        db.session.add(StockTransactionOut(
                            out_transaction_date=shipped_date,
                            out_quantity=quantity,
                            p_id=product.p_id,
                            warehouse_id=chosen_warehouse.warehouse_id,
                            so_item_id=so_item.so_item_id
                        ))

                        # ลดสต็อก
                        stock_level = StockLevel.query.filter_by(
                            p_id=product.p_id,
                            warehouse_id=chosen_warehouse.warehouse_id
                        ).first()
                        if stock_level:
                            stock_level.quantity = max(0, stock_level.quantity - quantity)

                so_counter += 1

            # Commit ทุก 10 วัน
            if (150 - i) % 10 == 0:
                db.session.commit()

        db.session.commit()
        print("   - ✅ 5-month realistic history generation complete.")
    except Exception as e:
        db.session.rollback()
        print(f"   - ❌ Error generating history: {e}")
        raise

    """Generates 60 days of purchase and sales history."""
    print("🗓️ Generating 150 days of purchase and sales history...")
    try:
        products = Product.query.all()
        farmers = Farmer.query.all()
        food_industries = FoodIndustry.query.all()
        warehouses = Warehouse.query.all()
        employees = Employee.query.all()

        # เลือกผู้ใช้แต่ละ role
        purchasing_users = [e for e in employees if e.e_role == EmployeeRole.PURCHASING]
        warehouse_users = [e for e in employees if e.e_role == EmployeeRole.WAREHOUSE]
        sales_users = [e for e in employees if e.e_role == EmployeeRole.SALES]
        accountant_users = [e for e in employees if e.e_role == EmployeeRole.ACCOUNTANT]
        executive_users = [e for e in employees if e.e_role == EmployeeRole.EXECUTIVE]

        # Start counters from the last known number to avoid duplicates
        last_po = PurchaseOrder.query.order_by(PurchaseOrder.purchase_order_number.desc()).first()
        po_counter = int(last_po.purchase_order_number[2:]) + 1 if last_po else 1

        last_so = SalesOrder.query.order_by(SalesOrder.sale_order_number.desc()).first()
        so_counter = int(last_so.sale_order_number[2:]) + 1 if last_so else 1

        for i in range(149, -1, -1): # Loop from 149 days ago to today (150 days)
            current_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            print(f"   - Processing transactions for {current_date.strftime('%Y-%m-%d')}...")

            # --- Create 1 to 2 Purchase Orders per day ---
            for _ in range(random.randint(1, 2)):
                po_number = f'PO{po_counter:03d}'
                chosen_warehouse_id = random.choice(warehouses).warehouse_id
                created_by = random.choice(purchasing_users) if purchasing_users else None
                paid_by = random.choice(accountant_users) if accountant_users else None
                received_by = random.choice(warehouse_users) if warehouse_users else None

                po = PurchaseOrder(
                    purchase_order_number=po_number,
                    f_id=random.choice(farmers).f_id,
                    b_date=current_date,
                    payment_status='Paid', stock_status='Completed',
                    created_by_id=created_by.e_id if created_by else None,
                    paid_by_id=paid_by.e_id if paid_by else None,
                    received_by_id=received_by.e_id if received_by else None,
                    created_date=current_date,
                    paid_date=current_date,
                    received_date=current_date
                )

                total_price = 0
                po_items_data = []
                for _ in range(random.randint(1, 2)):
                    product = random.choice(products)
                    # จำกัดจำนวนซื้อไม่ให้เกิน capacity ที่เหลือของ warehouse
                    stock_level = StockLevel.query.filter_by(p_id=product.p_id, warehouse_id=chosen_warehouse_id).first()
                    max_add = max(0, int(stock_level.quantity * 0.5)) if stock_level else 10000
                    quantity = random.randint(1000, max(2000, max_add))
                    price = round(product.price_per_unit * random.uniform(0.95, 1.05), 2)
                    po_items_data.append({'product': product, 'quantity': quantity, 'price': price})
                    total_price += quantity * price

                po.b_total_price = total_price
                db.session.add(po)
                db.session.flush()

                for item_data in po_items_data:
                    stock_level = StockLevel.query.filter_by(p_id=item_data['product'].p_id, warehouse_id=chosen_warehouse_id).first()
                    warehouse = next((w for w in warehouses if w.warehouse_id == chosen_warehouse_id), None)
                    # ตรวจสอบ capacity ก่อนเพิ่ม
                    max_add = warehouse.capacity - stock_level.quantity if (stock_level and warehouse) else 0
                    add_qty = min(item_data['quantity'], max_add)
                    if add_qty <= 0:
                        continue
                    po_item = PurchaseOrderItem(
                        purchase_order_number=po_number,
                        p_id=item_data['product'].p_id,
                        quantity=add_qty,
                        price_per_unit=item_data['price']
                    )
                    db.session.add(po_item)
                    db.session.flush()

                    db.session.add(StockTransactionIn(
                        in_transaction_date=current_date,
                        p_id=item_data['product'].p_id,
                        in_quantity=add_qty,
                        remaining_quantity=add_qty,
                        unit_cost=item_data['price'],
                        warehouse_id=chosen_warehouse_id,
                        po_item_id=po_item.po_item_id
                    ))
                    if stock_level:
                        stock_level.quantity += add_qty

                po_counter += 1

            # --- Create 1 to 3 Sales Orders per day ---
            for _ in range(random.randint(1, 3)):
                so_number = f'SO{so_counter:03d}'
                product_to_sell = random.choice(products)
                warehouse_to_sell_from_id = random.choice(warehouses).warehouse_id
                created_by = random.choice(sales_users) if sales_users else None
                shipped_by = random.choice(warehouse_users) if warehouse_users else None
                delivered_by = random.choice(sales_users) if sales_users else None
                paid_by = random.choice(accountant_users) if accountant_users else None

                stock_level = StockLevel.query.filter_by(p_id=product_to_sell.p_id, warehouse_id=warehouse_to_sell_from_id).first()
                if not stock_level or stock_level.quantity < 500:
                    continue

                quantity_to_sell = random.randint(100, min(1500, int(stock_level.quantity / 2)))
                price = round(product_to_sell.price_per_unit * random.uniform(1.2, 1.5), 2)

                so = SalesOrder(
                    sale_order_number=so_number,
                    F_id=random.choice(food_industries).F_id,
                    s_date=current_date,
                    s_total_price=quantity_to_sell * price,
                    shipment_status='Delivered', delivery_status='Delivered', payment_status='Paid',
                    created_by_id=created_by.e_id if created_by else None,
                    shipped_by_id=shipped_by.e_id if shipped_by else None,
                    delivered_by_id=delivered_by.e_id if delivered_by else None,
                    paid_by_id=paid_by.e_id if paid_by else None,
                    created_date=current_date,
                    shipped_date=current_date,
                    delivered_date=current_date,
                    paid_date=current_date,
                    warehouse_id=warehouse_to_sell_from_id
                )
                db.session.add(so)

                so_item = SalesOrderItem(
                    sale_order_number=so_number,
                    p_id=product_to_sell.p_id,
                    quantity=quantity_to_sell,
                    price_per_unit=price
                )
                db.session.add(so_item)
                db.session.flush()

                # FIFO COGS Calculation and Stock Out Transaction
                quantity_to_process, total_cogs = quantity_to_sell, 0
                stock_lots = StockTransactionIn.query.filter(
                    StockTransactionIn.p_id == product_to_sell.p_id,
                    StockTransactionIn.warehouse_id == warehouse_to_sell_from_id,
                    StockTransactionIn.remaining_quantity > 0
                ).order_by(StockTransactionIn.in_transaction_date.asc()).all()

                for lot in stock_lots:
                    if quantity_to_process <= 0: break
                    take_from_lot = min(quantity_to_process, lot.remaining_quantity)

                    db.session.add(StockTransactionOut(
                        out_transaction_date=current_date,
                        out_quantity=take_from_lot,
                        p_id=product_to_sell.p_id,
                        warehouse_id=warehouse_to_sell_from_id,
                        so_item_id=so_item.so_item_id
                    ))

                    total_cogs += take_from_lot * lot.unit_cost
                    lot.remaining_quantity -= take_from_lot
                    quantity_to_process -= take_from_lot

                db.session.add(SalesOrderItemCost(so_item_id=so_item.so_item_id, cogs=total_cogs))
                stock_level.quantity = max(0, stock_level.quantity - quantity_to_sell)
                so_counter += 1

        db.session.commit()
        print("   - ✅ History generation complete.")
    except Exception as e:
        db.session.rollback()
        print(f"   - ❌ Error generating history: {e}")

def seed_returns():
    """Generates some random return transactions for recent sales."""
    print("↩️ Generating random return transactions...")
    try:
        # Get sales items from the last 30 days
        recent_so_items = SalesOrderItem.query.join(SalesOrder).filter(
            SalesOrder.s_date >= datetime.utcnow() - timedelta(days=30)
        ).all()

        # Randomly select about 5% of items to be returned
        items_to_return = random.sample(recent_so_items, k=min(len(recent_so_items), max(1, int(len(recent_so_items) * 0.05))))

        if not items_to_return:
            print("   - No recent sales items to process returns for.")
            return

        for item in items_to_return:
            # Return a random quantity, but not more than what was sold
            return_qty = round(random.uniform(0.1, 0.5) * item.quantity, 2)
            if return_qty < 1: continue

            return_date = item.sales_order.delivered_date + timedelta(days=random.randint(1, 5))

            # Create the return transaction
            db.session.add(StockTransactionReturn(
                return_transaction_date=return_date,
                return_quantity=return_qty,
                p_id=item.p_id,
                warehouse_id=item.sales_order.warehouse_id,
                so_item_id=item.so_item_id
            ))

            # Update stock level
            stock_level = StockLevel.query.filter_by(
                p_id=item.p_id,
                warehouse_id=item.sales_order.warehouse_id
            ).first()
            if stock_level:
                stock_level.quantity += return_qty

            print(f"   - Processed return for SO Item ID {item.so_item_id} with quantity {return_qty}")

        db.session.commit()
        print("   - ✅ Return transaction generation complete.")
    except Exception as e:
        db.session.rollback()
        print(f"   - ❌ Error generating returns: {e}")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        clear_data()
        seed_base_data()
        seed_initial_stock()
        seed_transaction_history()
        seed_returns()
        print("\n🎉 Database seeding complete! 🎉")