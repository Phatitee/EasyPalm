# backend/app/routes.py

from flask import request, jsonify, Blueprint
from . import models
from . import db
from sqlalchemy import func
from datetime import datetime, timedelta
from sqlalchemy import asc

# 1. Blueprint Setup
# A Blueprint is a way to organize a group of related views and other code.
bp = Blueprint('main', __name__)


#==============================================================================
#   COMMON & UTILITY (API ที่ใช้ร่วมกัน)
# ==============================================================================

@bp.route('/')
def hello_world():
    return 'EasyPalm Backend is running!'

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'กรุณากรอก Username และ Password'}), 400

    employee = models.Employee.query.filter_by(username=data['username']).first()

    if not employee or employee.password != data['password']:
        return jsonify({'message': 'Username หรือ Password ไม่ถูกต้อง'}), 401
    
    # แปลง Enum เป็น string ก่อนส่งค่ากลับ
    user_data = employee.to_dict()
    # user_data['e_role'] = employee.e_role.value 

    return jsonify({
        'message': 'Login สำเร็จ',
        'user': user_data
    })

@bp.route('/products', methods=['GET'])
def get_products():
    """ ดึงข้อมูลสินค้าทั้งหมด """
    products = models.Product.query.all()
    return jsonify([p.to_dict() for p in products])

@bp.route('/farmers', methods=['GET'])
def get_farmers():
    """ ดึงข้อมูลเกษตรกรทั้งหมด """
    farmers = models.Farmer.query.all()
    return jsonify([f.to_dict() for f in farmers])

@bp.route('/food-industries', methods=['GET'])
def get_food_industries():
    """ ดึงข้อมูลโรงงานลูกค้าทั้งหมด """
    industries = models.FoodIndustry.query.all()
    return jsonify([i.to_dict() for i in industries])

@bp.route('/warehouses', methods=['GET'])
def get_warehouses():
    """ ดึงข้อมูลคลังสินค้าทั้งหมด """
    warehouses = models.Warehouse.query.all()
    return jsonify([w.to_dict() for w in warehouses])

# ==============================================================================
#   PRODUCT MANAGEMENT
# ==============================================================================

@bp.route('/products', methods=['GET', 'POST'])
def handle_products():
    """Handles fetching all products (GET) and creating a new product (POST)."""
    
    # --- Create New Product ---
    if request.method == 'POST':
        data = request.get_json()
        if not data or not 'p_name' in data or not 'price_per_unit' in data or not 'effective_date' in data:
            return jsonify({'message': 'Missing required data: p_name, price_per_unit, effective_date'}), 400
        
        new_product = models.Product(
            p_name=data['p_name'],
            price_per_unit=data['price_per_unit'],
            effective_date=data['effective_date']
        )
        db.session.add(new_product)
        db.session.commit()
        return jsonify(new_product.to_dict()), 201

    # --- Get All Products ---
    else: 
        products = models.Product.query.all()
        return jsonify([p.to_dict() for p in products])

@bp.route('/products/<int:p_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_product(p_id):
    """Handles fetching (GET), updating (PUT), or deleting (DELETE) a single product."""
    product = models.Product.query.get_or_404(p_id)

    if request.method == 'GET':
        return jsonify(product.to_dict())

    if request.method == 'PUT':
        data = request.get_json()
        product.p_name = data.get('p_name', product.p_name)
        product.price_per_unit = data.get('price_per_unit', product.price_per_unit)
        product.effective_date = data.get('effective_date', product.effective_date)
        db.session.commit()
        return jsonify(product.to_dict())

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Product with id {p_id} has been deleted.'})


# ==============================================================================
#   EMPLOYEE MANAGEMENT
# ==============================================================================

@bp.route('/employees', methods=['GET', 'POST'])
def handle_employees():
    """Handles fetching all employees (GET) and creating a new employee (POST)."""
    
    # --- Create New Employee ---
    if request.method == 'POST':
        data = request.get_json()
        required_fields = ['e_name', 'e_citizen_id_card', 'username', 'password', 'e_role', 'position']
        if not all(field in data for field in required_fields):
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400

        try:
            # Generate new employee ID
            last_employee = models.Employee.query.order_by(models.Employee.e_id.desc()).first()
            if last_employee and last_employee.e_id.startswith('E'):
                last_num = int(last_employee.e_id[1:])
                new_id = f'E{last_num + 1:03d}'
            else:
                new_id = 'E001'

            new_employee = models.Employee(
                e_id=new_id,
                e_name=data['e_name'],
                username=data['username'],
                password=data['password'],
                e_role=data['e_role'],
                position=data['position'],
                e_citizen_id_card=data['e_citizen_id_card'],
                e_email=data.get('e_email'),
                e_tel=data.get('e_tel'),
                e_gender=data.get('e_gender'),
                e_citizen_address=data.get('e_citizen_address'),
                e_address=data.get('e_address')
            )
            db.session.add(new_employee)
            db.session.commit()
            return jsonify(new_employee.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'message': 'Username หรือ เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
            return jsonify({'message': str(e)}), 500

    # --- Get All Employees ---
    else:
        try:
            employees = models.Employee.query.all()
            return jsonify([e.to_dict() for e in employees])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/employees/<string:e_id>', methods=['PUT', 'DELETE'])
def handle_employee(e_id):
    """Handles updating (PUT) or deleting (DELETE) a single employee."""
    employee = models.Employee.query.get_or_404(e_id)

    # --- Update Employee ---
    if request.method == 'PUT':
        data = request.get_json()
        try:
            employee.e_name = data.get('e_name', employee.e_name)
            employee.e_role = data.get('e_role', employee.e_role)
            employee.position = data.get('position', employee.position)
            employee.e_email = data.get('e_email', employee.e_email)
            employee.e_tel = data.get('e_tel', employee.e_tel)
            if data.get('password'):
                employee.password = data['password']
            db.session.commit()
            return jsonify(employee.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    # --- Delete Employee ---
    if request.method == 'DELETE':
        try:
            db.session.delete(employee)
            db.session.commit()
            return jsonify({'message': f'พนักงานรหัส {e_id} ถูกลบเรียบร้อยแล้ว'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500


# ==============================================================================
#   FARMER MANAGEMENT
# ==============================================================================

@bp.route('/farmers', methods=['GET', 'POST'])
def handle_farmers():
    """Handles fetching all farmers (GET) and creating a new farmer (POST)."""
    
    # --- Create New Farmer ---
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('f_name') or not data.get('f_citizen_id_card') or not data.get('f_tel'):
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ ชื่อ, เลขบัตรประชาชน, เบอร์โทร)'}), 400
        try:
            # Generate new farmer ID
            last_farmer = models.Farmer.query.order_by(models.Farmer.f_id.desc()).first()
            new_id = 'F001'
            if last_farmer and last_farmer.f_id.startswith('F'):
                last_num = int(last_farmer.f_id[1:])
                new_id = f'F{last_num + 1:03d}'
            
            new_farmer = models.Farmer(
                f_id=new_id,
                f_name=data['f_name'],
                f_citizen_id_card=data['f_citizen_id_card'],
                f_tel=data['f_tel'],
                f_address=data.get('f_address', ''),
                f_create_date=datetime.utcnow()
            )
            db.session.add(new_farmer)
            db.session.commit()
            return jsonify(new_farmer.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'message': 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
            return jsonify({'message': 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์'}), 500
    
    # --- Get All Farmers ---
    else:
        try:
            farmers = models.Farmer.query.all()
            return jsonify([f.to_dict() for f in farmers])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/farmers/<string:f_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_farmer(f_id):
    """Handles fetching (GET), updating (PUT), or deleting (DELETE) a single farmer."""
    farmer = models.Farmer.query.get_or_404(f_id)

    if request.method == 'GET':
        return jsonify(farmer.to_dict())

    if request.method == 'PUT':
        data = request.get_json()
        try:
            farmer.f_name = data.get('f_name', farmer.f_name)
            farmer.f_citizen_id_card = data.get('f_citizen_id_card', farmer.f_citizen_id_card)
            farmer.f_tel = data.get('f_tel', farmer.f_tel)
            farmer.f_address = data.get('f_address', farmer.f_address)
            farmer.f_modified_date = datetime.utcnow()
            db.session.commit()
            return jsonify(farmer.to_dict())
        except Exception as e:
            db.session.rollback()
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'message': 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
            return jsonify({'message': str(e)}), 500

    if request.method == 'DELETE':
        try:
            db.session.delete(farmer)
            db.session.commit()
            return jsonify({'message': f'เกษตรกร {f_id} ถูกลบเรียบร้อยแล้ว'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500


# ==============================================================================
#   FOOD INDUSTRY (CUSTOMER) MANAGEMENT
# ==============================================================================

@bp.route('/food-industries', methods=['GET', 'POST'])
def handle_food_industries():
    """Handles fetching all food industries (GET) and creating a new one (POST)."""

    # --- Create New Food Industry ---
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('F_name') or not data.get('F_tel'):
            return jsonify({'message': 'กรุณากรอกข้อมูล ชื่อและเบอร์โทร'}), 400
        try:
            # Generate new ID
            last_industry = models.FoodIndustry.query.order_by(models.FoodIndustry.F_id.desc()).first()
            new_id = 'C001'
            if last_industry and last_industry.F_id.startswith('C'):
                last_num = int(last_industry.F_id[1:])
                new_id = f'C{last_num + 1:03d}'

            new_industry = models.FoodIndustry(
                F_id=new_id,
                F_name=data['F_name'],
                F_tel=data['F_tel'],
                F_address=data.get('F_address', '')
            )
            db.session.add(new_industry)
            db.session.commit()
            return jsonify(new_industry.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
    
    # --- Get All Food Industries ---
    else:
        try:
            industries = models.FoodIndustry.query.order_by(models.FoodIndustry.F_name).all()
            return jsonify([i.to_dict() for i in industries])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/food-industries/<string:f_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_food_industry(f_id):
    """Handles fetching (GET), updating (PUT), or deleting (DELETE) a single food industry."""
    industry = models.FoodIndustry.query.get_or_404(f_id)

    if request.method == 'GET':
        return jsonify(industry.to_dict())

    if request.method == 'PUT':
        data = request.get_json()
        try:
            industry.F_name = data.get('F_name', industry.F_name)
            industry.F_tel = data.get('F_tel', industry.F_tel)
            industry.F_address = data.get('F_address', industry.F_address)
            db.session.commit()
            return jsonify(industry.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
            
    if request.method == 'DELETE':
        try:
            db.session.delete(industry)
            db.session.commit()
            return jsonify({'message': f'ลบข้อมูล {f_id} สำเร็จ'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
        
# ==============================================================================
#   WAREHOUSE MANAGEMENT
# ==============================================================================

@bp.route('/warehouses', methods=['GET', 'POST'])
def handle_warehouses():
    """ (สร้างใหม่) Handles fetching all warehouses and creating a new one. """
    
    # --- Create New Warehouse ---
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('warehouse_id') or not data.get('warehouse_name'):
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ warehouse_id และ warehouse_name)'}), 400
        
        # Check if ID already exists
        if models.Warehouse.query.get(data['warehouse_id']):
            return jsonify({'message': 'รหัสคลังสินค้านี้มีอยู่แล้ว'}), 409

        try:
            new_warehouse = models.Warehouse(
                warehouse_id=data['warehouse_id'],
                warehouse_name=data['warehouse_name'],
                location=data.get('location')
            )
            db.session.add(new_warehouse)
            db.session.commit()
            return jsonify(new_warehouse.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    # --- Get All Warehouses ---
    else: # GET
        try:
            warehouses = models.Warehouse.query.all()
            return jsonify([w.to_dict() for w in warehouses])
        except Exception as e:
            return jsonify({'message': str(e)}), 500


@bp.route('/warehouses/<string:warehouse_id>', methods=['PUT', 'DELETE'])
def handle_warehouse(warehouse_id):
    """ (สร้างใหม่) Handles updating or deleting a single warehouse. """
    warehouse = models.Warehouse.query.get_or_404(warehouse_id)

    # --- Update Warehouse ---
    if request.method == 'PUT':
        data = request.get_json()
        try:
            warehouse.warehouse_name = data.get('warehouse_name', warehouse.warehouse_name)
            warehouse.location = data.get('location', warehouse.location)
            db.session.commit()
            return jsonify(warehouse.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    # --- Delete Warehouse ---
    if request.method == 'DELETE':
        # Optional: Check if warehouse is in use before deleting
        if models.StockLevel.query.filter_by(warehouse_id=warehouse_id).first():
            return jsonify({'message': 'ไม่สามารถลบคลังสินค้าได้เนื่องจากมีสต็อกสินค้าอยู่'}), 409
        try:
            db.session.delete(warehouse)
            db.session.commit()
            return jsonify({'message': f'คลังสินค้า {warehouse_id} ถูกลบเรียบร้อยแล้ว'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500


# ==============================================================================
#   PURCHASE & STOCK MANAGEMENT
# ==============================================================================

@bp.route('/purchaseorders', methods=['GET', 'POST'])
def handle_purchase_orders():
    """Handles creating (POST) and retrieving (GET) purchase orders with filtering."""
    
    # --- Create New Purchase Order ---
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('f_id') or not isinstance(data.get('items'), list) or not data.get('items'):
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ f_id และ items ที่เป็น array)'}), 400
        try:
            # Generate new PO number
            last_order = models.PurchaseOrder.query.order_by(models.PurchaseOrder.purchase_order_number.desc()).first()
            new_po_number = 'PO001'
            if last_order and last_order.purchase_order_number.startswith('PO'):
                last_num = int(last_order.purchase_order_number[2:])
                new_po_number = f'PO{last_num + 1:03d}'
            
            total_price = sum(item['quantity'] * item['price_per_unit'] for item in data['items'])
            
            new_order = models.PurchaseOrder(
                purchase_order_number=new_po_number,
                f_id=data['f_id'],
                b_total_price=total_price,
                b_date=datetime.utcnow(),
                payment_status='Unpaid'
            )
            db.session.add(new_order)
            
            for item_data in data['items']:
                order_item = models.PurchaseOrderItem(
                    purchase_order_number=new_po_number,
                    p_id=item_data['p_id'],
                    quantity=item_data['quantity'],
                    price_per_unit=item_data['price_per_unit']
                )
                db.session.add(order_item)
            
            db.session.commit()
            return jsonify(new_order.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
    
    # --- Get All Purchase Orders with Filters ---
    else:
        try:
            query = models.PurchaseOrder.query
            
            if status := request.args.get('status'):
                if status == 'unpaid':
                    query = query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None]))
            
            if search_name := request.args.get('name'):
                query = query.join(models.Farmer).filter(models.Farmer.f_name.ilike(f'%{search_name}%'))
            
            if start_date_str := request.args.get('start_date'):
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                query = query.filter(models.PurchaseOrder.b_date >= start_date)
            
            if end_date_str := request.args.get('end_date'):
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
                query = query.filter(models.PurchaseOrder.b_date <= end_date)
            
            orders = query.order_by(models.PurchaseOrder.b_date.desc()).all()
            return jsonify([order.to_dict() for order in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/purchaseorders/<string:order_number>/pay', methods=['PUT'])
def mark_order_as_paid(order_number):
    """
    (แก้ไขใหม่) อัปเดตสถานะการจ่ายเงิน และเปลี่ยนสถานะสต็อกเป็น 'Pending'
    *** ไม่มีการอัปเดตสต็อกที่นี่อีกต่อไป ***
    """
    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        if order.payment_status == 'Paid':
            return jsonify({'message': 'ใบเสร็จนี้ถูกจ่ายเงินไปแล้ว'}), 409
        
        order.payment_status = 'Paid'
        order.stock_status = 'Pending' # <-- เปลี่ยนสถานะเพื่อให้พนักงานคลังเห็น
        db.session.commit()
        
        return jsonify(order.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/stock', methods=['GET'])
def get_stock_levels():
    """Retrieves all current stock levels."""
    try:
        all_stock = models.StockLevel.query.all()
        return jsonify([s.to_dict() for s in all_stock])
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
# ==============================================================================
#   WAREHOUSE MANAGEMENT (สร้างใหม่สำหรับเจ้าหน้าที่คลังสินค้า)
# ==============================================================================

@bp.route('/api/warehouse/pending-receipts', methods=['GET'])
def get_pending_receipts():
    """ (API ใหม่) ดึงรายการ PO ที่จ่ายเงินแล้ว แต่รอการจัดเก็บ """
    try:
        pending_orders = models.PurchaseOrder.query.filter_by(
            payment_status='Paid', 
            stock_status='Pending'
        ).order_by(models.PurchaseOrder.b_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/api/warehouse/receive-items', methods=['POST'])
def receive_items_into_stock():
    """ 
    (API ใหม่) ยืนยันการรับสินค้าเข้าคลัง และอัปเดตสต็อก
    *** Logic การอัปเดตสต็อกทั้งหมดจะอยู่ที่นี่ ***
    """
    data = request.get_json()
    if not data or not data.get('purchase_order_number') or not data.get('warehouse_id'):
        return jsonify({'message': 'ต้องการ purchase_order_number และ warehouse_id'}), 400

    order_number = data['purchase_order_number']
    warehouse_id = data['warehouse_id']

    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        if order.stock_status == 'Completed':
            return jsonify({'message': 'ใบสั่งซื้อนี้ถูกจัดเก็บเข้าคลังไปแล้ว'}), 409

        if not models.Warehouse.query.get(warehouse_id):
            return jsonify({'message': f'ไม่พบคลังสินค้า {warehouse_id}'}), 404

        # --- Logic การอัปเดตสต็อก (ย้ายมาจากฟังก์ชัน pay) ---
        for item in order.items:
            stock_in = models.StockTransactionIn(
                in_transaction_date=datetime.utcnow(),
                p_id=item.p_id,
                in_quantity=item.quantity,
                remaining_quantity=item.quantity,
                unit_cost=item.price_per_unit,
                warehouse_id=warehouse_id,
                po_item_id=item.po_item_id
            )
            db.session.add(stock_in)
            
            stock_level = models.StockLevel.query.filter_by(p_id=item.p_id, warehouse_id=warehouse_id).first()
            if stock_level:
                stock_level.quantity += item.quantity
            else:
                new_stock = models.StockLevel(p_id=item.p_id, warehouse_id=warehouse_id, quantity=item.quantity)
                db.session.add(new_stock)
        
        order.stock_status = 'Completed'
        db.session.commit()
        return jsonify({'message': f'รับสินค้าจาก PO {order_number} เข้าคลัง {warehouse_id} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/api/warehouse/stock-in-history', methods=['GET'])
def get_stock_in_history():
    """ (API ใหม่) ดึงประวัติการรับสินค้าเข้าทั้งหมด """
    try:
        history = db.session.query(
            models.StockTransactionIn,
            models.Product.p_name,
            models.Warehouse.warehouse_name,
            models.PurchaseOrderItem.purchase_order_number
        ).join(models.Product, models.StockTransactionIn.p_id == models.Product.p_id)\
         .join(models.Warehouse, models.StockTransactionIn.warehouse_id == models.Warehouse.warehouse_id)\
         .join(models.PurchaseOrderItem, models.StockTransactionIn.po_item_id == models.PurchaseOrderItem.po_item_id)\
         .order_by(models.StockTransactionIn.in_transaction_date.desc()).all()

        results = []
        for trans, p_name, w_name, po_num in history:
            results.append({
                'transaction_id': trans.in_transaction_id,
                'date': trans.in_transaction_date.isoformat(),
                'product_name': p_name,
                'quantity': trans.in_quantity,
                'unit_cost': trans.unit_cost,
                'warehouse_name': w_name,
                'po_number': po_num
            })
        return jsonify(results)
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/api/warehouse/pending-shipments', methods=['GET'])
def get_pending_shipments():
    """ (API ใหม่) ดึงรายการ SO ที่รอการเบิกสินค้า """
    try:
        pending_orders = models.SalesOrder.query.filter_by(
            shipment_status='Pending'
        ).order_by(models.SalesOrder.s_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/api/warehouse/ship-order/<string:order_number>', methods=['POST'])
def ship_sales_order(order_number):
    """ (API ใหม่) ยืนยันการเบิก/จัดส่งสินค้า """
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        if order.shipment_status == 'Shipped':
            return jsonify({'message': 'ใบสั่งขายนี้ถูกจัดส่งไปแล้ว'}), 409

        order.shipment_status = 'Shipped'
        db.session.commit()
        return jsonify({'message': f'ยืนยันการจัดส่ง SO {order_number} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


# ==============================================================================
#   SALES MANAGEMENT
# ==============================================================================

@bp.route('/salesorders', methods=['GET', 'POST'])
def handle_sales_orders():
    """Handles creating (POST) and retrieving (GET) sales orders."""
    
    # --- (แก้ไขใหม่ทั้งหมด) Create New Sales Order, Deduct Stock, and Calculate COGS ---
    if request.method == 'POST':
        data = request.get_json()
        required_fields = ['f_id', 'items', 'warehouse_id']
        if not all(field in data for field in required_fields) or not isinstance(data['items'], list) or not data['items']:
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ f_id, warehouse_id, และ items ที่เป็น array)'}), 400
        
        warehouse_id = data['warehouse_id']
        
        # ใช้ transaction block เพื่อให้มั่นใจว่าถ้ามีข้อผิดพลาดจะ rollback ทั้งหมด
        try:
            # --- Step 1: ตรวจสอบสต็อกคงเหลือทั้งหมดก่อน ---
            for item_data in data['items']:
                stock_level = models.StockLevel.query.filter_by(
                    p_id=item_data['p_id'], warehouse_id=warehouse_id
                ).first()
                if not stock_level or stock_level.quantity < float(item_data['quantity']):
                    product = models.Product.query.get(item_data['p_id'])
                    return jsonify({'message': f'สินค้า "{product.p_name}" ในคลัง "{warehouse_id}" มีไม่พอขาย!'}), 400

            # --- Step 2: สร้าง Sales Order หลักและรายการย่อย ---
            last_order = models.SalesOrder.query.order_by(models.SalesOrder.sale_order_number.desc()).first()
            new_so_number = 'SO001'
            if last_order and last_order.sale_order_number.startswith('SO'):
                last_num = int(last_order.sale_order_number[2:])
                new_so_number = f'SO{last_num + 1:03d}'
            
            total_price = sum(item['quantity'] * item['price_per_unit'] for item in data['items'])

            new_order = models.SalesOrder(
                sale_order_number=new_so_number,
                f_id=data['f_id'],
                s_total_price=total_price,
                s_date=datetime.utcnow(),
                shipment_status='Pending'
            )
            db.session.add(new_order)
            
            # สร้าง SalesOrderItem และเก็บไว้ใน list ชั่วคราว
            new_order_items = []
            for item_data in data['items']:
                order_item = models.SalesOrderItem(
                    sale_order_number=new_so_number,
                    p_id=item_data['p_id'],
                    quantity=float(item_data['quantity']),
                    price_per_unit=float(item_data['price_per_unit'])
                )
                db.session.add(order_item)
                new_order_items.append(order_item)
            
            # Commit ครั้งแรกเพื่อให้ได้ so_item_id
            db.session.flush()

            # --- Step 3: คำนวณ COGS และตัดสต็อก (FIFO Logic) ---
            for item in new_order_items:
                quantity_to_sell = item.quantity
                cogs_for_item = 0.0

                # 3.1 ค้นหาล็อตสินค้าที่ยังเหลืออยู่ โดยเรียงจากเก่าสุด (FIFO)
                stock_in_lots = models.StockTransactionIn.query.filter(
                    models.StockTransactionIn.p_id == item.p_id,
                    models.StockTransactionIn.warehouse_id == warehouse_id,
                    models.StockTransactionIn.remaining_quantity > 0
                ).order_by(asc(models.StockTransactionIn.in_transaction_date)).all()

                # 3.2 วนลูปตัดสต็อกในแต่ละล็อต
                for lot in stock_in_lots:
                    if quantity_to_sell <= 0:
                        break

                    quantity_from_this_lot = min(lot.remaining_quantity, quantity_to_sell)
                    
                    cogs_for_item += quantity_from_this_lot * lot.unit_cost
                    
                    lot.remaining_quantity -= quantity_from_this_lot
                    quantity_to_sell -= quantity_from_this_lot

                if quantity_to_sell > 0:
                    # กรณีนี้ไม่ควรจะเกิดขึ้นถ้า Step 1 ทำงานถูกต้อง แต่เป็นการป้องกันไว้
                    raise Exception(f'เกิดข้อผิดพลาดในการคำนวณสต็อกสำหรับสินค้า {item.p_id}')

                # 3.3 บันทึก COGS ที่คำนวณได้
                new_cogs_record = models.SalesOrderItemCost(so_item_id=item.so_item_id, cogs=cogs_for_item)
                db.session.add(new_cogs_record)

                # 3.4 สร้าง StockTransactionOut
                new_stock_out = models.StockTransactionOut(
                    out_transaction_date=datetime.utcnow(),
                    p_id=item.p_id,
                    out_quantity=item.quantity,
                    warehouse_id=warehouse_id,
                    so_item_id=item.so_item_id
                )
                db.session.add(new_stock_out)

                # 3.5 อัปเดตยอดรวมใน StockLevel
                stock_level_to_update = models.StockLevel.query.filter_by(
                    p_id=item.p_id, warehouse_id=warehouse_id
                ).first()
                stock_level_to_update.quantity -= item.quantity
            
            # --- Step 4: Commit transaction ทั้งหมด ---
            db.session.commit()
            return jsonify(new_order.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
    
    # --- Get All Sales Orders (โค้ดส่วนนี้เหมือนเดิม) ---
    else:
        try:
            orders = models.SalesOrder.query.order_by(models.SalesOrder.s_date.desc()).all()
            return jsonify([order.to_dict() for order in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500
# ==============================================================================
#   ADMIN DASHBOARD
# ==============================================================================

@bp.route('/admin/dashboard-summary', methods=['GET'])
def get_admin_dashboard_summary():
    """Provides a summary of key metrics and recent activities for the admin dashboard."""
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # 1. Key Metrics
        purchase_today = db.session.query(func.sum(models.PurchaseOrder.b_total_price)).filter(
            models.PurchaseOrder.b_date >= today_start
        ).scalar() or 0
        
        pending_payments_count = models.PurchaseOrder.query.filter(
            models.PurchaseOrder.payment_status.in_(['Unpaid', None])
        ).count()
        
        employee_count = models.Employee.query.count()
        farmer_count = models.Farmer.query.count()

        # 2. Recent Purchases
        recent_purchases = models.PurchaseOrder.query.order_by(models.PurchaseOrder.b_date.desc()).limit(5).all()

        # 3. Chart Data (Purchase totals for the last 7 days)
        seven_days_ago = today_start - timedelta(days=6)
        purchase_by_day = db.session.query(
            func.date(models.PurchaseOrder.b_date),
            func.sum(models.PurchaseOrder.b_total_price)
        ).filter(models.PurchaseOrder.b_date >= seven_days_ago).group_by(func.date(models.PurchaseOrder.b_date)).all()
        
        chart_data = {str(date): total for date, total in purchase_by_day}

        summary = {
            'key_metrics': {
                'purchase_today': purchase_today,
                'pending_payments': pending_payments_count,
                'employee_count': employee_count,
                'farmer_count': farmer_count
            },
            'recent_purchases': [order.to_dict() for order in recent_purchases],
            'purchase_chart_data': chart_data
        }
        return jsonify(summary)
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    

# ==============================================================================
#   REPORTS
# ==============================================================================

@bp.route('/api/reports/profit-loss', methods=['GET'])
def get_profit_loss_report():
    """
    (สร้างใหม่) Calculates and returns a profit and loss summary for a given date range.
    Accepts 'start_date' and 'end_date' as query parameters (YYYY-MM-DD).
    """
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({"error": "กรุณาระบุ start_date และ end_date (YYYY-MM-DD)"}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
    except ValueError:
        return jsonify({"error": "รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้ YYYY-MM-DD"}), 400

    # 1. คำนวณรายรับรวม (Total Revenue)
    total_revenue = db.session.query(func.sum(models.SalesOrder.s_total_price)).filter(
        models.SalesOrder.s_date.between(start_date, end_date)
    ).scalar() or 0.0

    # 2. คำนวณต้นทุนขายรวม (Total COGS)
    total_cogs = db.session.query(func.sum(models.SalesOrderItemCost.cogs)).join(
        models.SalesOrderItem
    ).join(models.SalesOrder).filter(
        models.SalesOrder.s_date.between(start_date, end_date)
    ).scalar() or 0.0
    
    # 3. คำนวณกำไรขั้นต้น
    gross_profit = total_revenue - total_cogs

    return jsonify({
        'start_date': start_date_str,
        'end_date': end_date_str,
        'total_revenue': round(total_revenue, 2),
        'total_cogs': round(total_cogs, 2),
        'gross_profit': round(gross_profit, 2)
    })