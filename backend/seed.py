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

    # --- Farmers & Customers ---
    farmers = [
        Farmer(f_id='F001', f_name='สมชาย สวนปาล์ม', f_citizen_id_card='1234567890121', f_tel='0812345678', f_address='123 หมู่ 5 ต.ปาล์ม อ.เกษตรสุข จ.สมุทรสงคราม'),
        Farmer(f_id='F002', f_name='สมศรี ไร่ดี', f_citizen_id_card='1234567890122', f_tel='0887654321', f_address='456 หมู่ 2 ต.น้ำมัน อ.เกษตรสุข จ.สมุทรสงคราม')
    ]
    food_industries = [
        FoodIndustry(F_id='C001', F_name='บริษัท น้ำมันพืชดีเด่น จำกัด', F_tel='021112222', F_address='กทม.'),
        FoodIndustry(F_id='C002', F_name='โรงงานสบู่หอมไกล', F_tel='023334444', F_address='สมุทรปราการ')
    ]

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
        for p in products:
            for w in warehouses:
                existing_stock = StockLevel.query.filter_by(p_id=p.p_id, warehouse_id=w.warehouse_id).first()
                if not existing_stock:
                    db.session.add(StockLevel(p_id=p.p_id, warehouse_id=w.warehouse_id, quantity=0))
        db.session.commit()

        # PO001: Huge stock for P001 & P003 in W001
        po1_date = datetime.utcnow() - timedelta(days=70)
        po1 = PurchaseOrder(
            purchase_order_number='PO001', f_id='F001', b_date=po1_date, b_total_price=(200000 * 5.50) + (50000 * 18.0),
            payment_status='Paid', stock_status='Completed', created_by_id='E005', paid_by_id='E003', received_by_id='E004',
            created_date=po1_date, paid_date=po1_date + timedelta(days=1), received_date=po1_date + timedelta(days=2)
        )
        po1_items = [
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P001', quantity=200000, price_per_unit=5.50),
            PurchaseOrderItem(purchase_order_number='PO001', p_id='P003', quantity=50000, price_per_unit=18.0)
        ]
        db.session.add(po1)
        db.session.add_all(po1_items)
        db.session.flush()

        stock_in1 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P001', in_quantity=200000, remaining_quantity=200000, unit_cost=5.50, warehouse_id='W001', po_item_id=po1_items[0].po_item_id)
        stock_in2 = StockTransactionIn(in_transaction_date=po1.received_date, p_id='P003', in_quantity=50000, remaining_quantity=50000, unit_cost=18.0, warehouse_id='W001', po_item_id=po1_items[1].po_item_id)
        db.session.add_all([stock_in1, stock_in2])

        StockLevel.query.filter_by(p_id='P001', warehouse_id='W001').first().quantity += 200000
        StockLevel.query.filter_by(p_id='P003', warehouse_id='W001').first().quantity += 50000

        # PO002: Second batch of P001 for COGS testing in W002
        po2_date = datetime.utcnow() - timedelta(days=65)
        po2 = PurchaseOrder(purchase_order_number='PO002', f_id='F002', b_date=po2_date, b_total_price=(100000 * 5.80), payment_status='Paid', stock_status='Completed', created_by_id='E005', paid_by_id='E003', received_by_id='E004', created_date=po2_date, paid_date=po2_date + timedelta(days=1), received_date=po2_date + timedelta(days=2))
        po2_items = [PurchaseOrderItem(purchase_order_number='PO002', p_id='P001', quantity=100000, price_per_unit=5.80)]
        db.session.add(po2)
        db.session.add_all(po2_items)
        db.session.flush()

        stock_in3 = StockTransactionIn(in_transaction_date=po2.received_date, p_id='P001', in_quantity=100000, remaining_quantity=100000, unit_cost=5.80, warehouse_id='W002', po_item_id=po2_items[0].po_item_id)
        db.session.add(stock_in3)
        StockLevel.query.filter_by(p_id='P001', warehouse_id='W002').first().quantity += 100000

        db.session.commit()
        print("   - ✅ Initial stock seeded successfully.")
    except Exception as e:
        db.session.rollback()
        print(f"   - ❌ Error seeding initial stock: {e}")

def seed_transaction_history():
    """Generates 60 days of purchase and sales history."""
    print("🗓️ Generating 60 days of purchase and sales history...")
    try:
        products = Product.query.all()
        farmers = Farmer.query.all()
        food_industries = FoodIndustry.query.all()
        warehouses = Warehouse.query.all()

        # Start counters from the last known number to avoid duplicates
        last_po = PurchaseOrder.query.order_by(PurchaseOrder.purchase_order_number.desc()).first()
        po_counter = int(last_po.purchase_order_number[2:]) + 1 if last_po else 1

        last_so = SalesOrder.query.order_by(SalesOrder.sale_order_number.desc()).first()
        so_counter = int(last_so.sale_order_number[2:]) + 1 if last_so else 1

        for i in range(59, -1, -1): # Loop from 59 days ago to today
            current_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
            print(f"   - Processing transactions for {current_date.strftime('%Y-%m-%d')}...")

            # --- Create 1 to 2 Purchase Orders per day ---
            for _ in range(random.randint(1, 2)):
                po_number = f'PO{po_counter:03d}'
                chosen_warehouse_id = random.choice(warehouses).warehouse_id

                po = PurchaseOrder(
                    purchase_order_number=po_number, f_id=random.choice(farmers).f_id, b_date=current_date,
                    payment_status='Paid', stock_status='Completed', created_by_id='E005', paid_by_id='E003', received_by_id='E004',
                    created_date=current_date, paid_date=current_date, received_date=current_date
                )

                total_price = 0
                po_items_data = []
                for _ in range(random.randint(1, 2)):
                    product = random.choice(products)
                    quantity = random.randint(5000, 20000)
                    price = round(product.price_per_unit * random.uniform(0.95, 1.05), 2)
                    po_items_data.append({'product': product, 'quantity': quantity, 'price': price})
                    total_price += quantity * price

                po.b_total_price = total_price
                db.session.add(po)
                db.session.flush()

                for item_data in po_items_data:
                    po_item = PurchaseOrderItem(purchase_order_number=po_number, p_id=item_data['product'].p_id, quantity=item_data['quantity'], price_per_unit=item_data['price'])
                    db.session.add(po_item)
                    db.session.flush()

                    db.session.add(StockTransactionIn(
                        in_transaction_date=current_date, p_id=item_data['product'].p_id, in_quantity=item_data['quantity'],
                        remaining_quantity=item_data['quantity'], unit_cost=item_data['price'],
                        warehouse_id=chosen_warehouse_id, po_item_id=po_item.po_item_id
                    ))
                    stock_level = StockLevel.query.filter_by(p_id=item_data['product'].p_id, warehouse_id=chosen_warehouse_id).first()
                    stock_level.quantity += item_data['quantity']

                po_counter += 1

            # --- Create 1 to 3 Sales Orders per day ---
            for _ in range(random.randint(1, 3)):
                so_number = f'SO{so_counter:03d}'
                product_to_sell = random.choice(products)
                warehouse_to_sell_from_id = random.choice(warehouses).warehouse_id

                stock_level = StockLevel.query.filter_by(p_id=product_to_sell.p_id, warehouse_id=warehouse_to_sell_from_id).first()
                if not stock_level or stock_level.quantity < 500:
                    continue

                quantity_to_sell = random.randint(100, min(1500, int(stock_level.quantity / 2)))
                price = round(product_to_sell.price_per_unit * random.uniform(1.2, 1.5), 2)

                so = SalesOrder(
                    sale_order_number=so_number, F_id=random.choice(food_industries).F_id, s_date=current_date,
                    s_total_price=quantity_to_sell * price, shipment_status='Delivered', delivery_status='Delivered', payment_status='Paid',
                    created_by_id='E002', shipped_by_id='E004', delivered_by_id='E002', paid_by_id='E003',
                    created_date=current_date, shipped_date=current_date, delivered_date=current_date, paid_date=current_date,
                    warehouse_id=warehouse_to_sell_from_id
                )
                db.session.add(so)

                so_item = SalesOrderItem(sale_order_number=so_number, p_id=product_to_sell.p_id, quantity=quantity_to_sell, price_per_unit=price)
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
                stock_level.quantity -= quantity_to_sell
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