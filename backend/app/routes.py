# backend/app/routes.py

from flask import request, jsonify, Blueprint
from . import models  # Import the 'models' object which contains all our model classes
from . import db  # Import the 'db' object for database sessions
from sqlalchemy import func  
   
from datetime import datetime, timedelta

# 1. Create a Blueprint
# A Blueprint is a way to organize a group of related views and other code.
# 'main' is the name of this blueprint.
bp = Blueprint('main', __name__)


# 2. Define a simple route for the root URL
@bp.route('/')
def hello_world():
    """A simple welcome message to confirm the backend is running."""
    return 'EasyPalm Backend is running!'


# 3. Define API endpoints for the 'Product' model
# =================================================
# This single function handles two HTTP methods for the /products URL:
# - GET: To fetch a list of all products.
# - POST: To create a new product.
@bp.route('/products', methods=['GET', 'POST'])
def handle_products():
    """Handles fetching all products and creating a new product."""
    
    # --- Handle POST Request (Create) ---
    if request.method == 'POST':
        data = request.get_json()

        # Basic validation to ensure required data is present
        if not data or not 'p_name' in data or not 'price_per_unit' in data or not 'effective_date' in data:
            return jsonify({'message': 'Missing required data: p_name, price_per_unit, effective_date'}), 400
        
        # Create a new Product instance using the data from the request
        new_product = models.Product(
            p_name=data['p_name'],
            price_per_unit=data['price_per_unit'],
            effective_date=data['effective_date'] # Assumes date is in YYYY-MM-DD format
        )

        # Add the new product to the database session and commit
        db.session.add(new_product)
        db.session.commit()
        
        # Return the newly created product's data with a 201 Created status
        return jsonify(new_product.to_dict()), 201

    # --- Handle GET Request (Read All) ---
    else: 
        # Query the database for all records in the Product table
        products = models.Product.query.all()
        # Convert each product object to a dictionary and return as a JSON array
        return jsonify([p.to_dict() for p in products])
    
# --- Update Product Price ---
@bp.route('/products/<string:p_id>', methods=['PUT'])
def update_product(p_id):
    # ค้นหาสินค้าจาก ID ที่ส่งมา, ถ้าไม่เจอจะ trả về 404 Not Found
    product = models.Product.query.get_or_404(p_id)

    data = request.get_json()
    if not data or 'price_per_unit' not in data:
        return jsonify({'message': 'กรุณาส่งข้อมูลราคาใหม่ (price_per_unit)'}), 400

    try:
        # อัปเดตราคาและวันที่
        product.price_per_unit = float(data['price_per_unit'])
        product.effective_date = datetime.utcnow()

        db.session.commit()

        print(f"อัปเดตราคาสินค้า {p_id} เป็น {data['price_per_unit']}")
        return jsonify(product.to_dict())

    except Exception as e:
        db.session.rollback()
        print(f"เกิดข้อผิดพลาดในการอัปเดตราคา: {str(e)}")
        return jsonify({'message': str(e)}), 500

# This function handles operations for a *specific* product, identified by its ID in the URL.
# It supports GET (read one), PUT (update), and DELETE.
@bp.route('/products/<int:p_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_product(p_id):
    """Handles fetching, updating, or deleting a single product by its ID."""
    
    # First, try to get the product by its ID. If not found, it will return a 404 error.
    product = models.Product.query.get_or_404(p_id)

    # --- Handle GET Request (Read One) ---
    if request.method == 'GET':
        return jsonify(product.to_dict())

    # --- Handle PUT Request (Update) ---
    if request.method == 'PUT':
        data = request.get_json()
        
        # Update product attributes with new data if provided in the request
        product.p_name = data.get('p_name', product.p_name)
        product.price_per_unit = data.get('price_per_unit', product.price_per_unit)
        product.effective_date = data.get('effective_date', product.effective_date)
        
        # Commit the changes to the database
        db.session.commit()
        
        # Return the updated product data
        return jsonify(product.to_dict())

    # --- Handle DELETE Request ---
    if request.method == 'DELETE':
        # Delete the product from the database
        db.session.delete(product)
        db.session.commit()
        
        # Return a success message
        return jsonify({'message': f'Product with id {p_id} has been deleted.'})


# 4. Add more API endpoints for other models here
# ================================================
# Example for Farmer:
# @bp.route('/farmers', methods=['GET'])
# def get_farmers():
#     farmers = models.Farmer.query.all()
#     return jsonify([f.to_dict() for f in farmers])
# backend/app/routes.py
# ... (โค้ดเดิม) ...

# 4. Add more API endpoints for other models here
# ================================================

# == Employee API Endpoints ==
@bp.route('/employees', methods=['GET'])
def get_employees():
    """Fetches all employees."""
    try:
        employees = models.Employee.query.all()
        # อย่าลืมเพิ่ม to_dict() ใน Employee Model ด้วย
        return jsonify([e.to_dict() for e in employees])
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
# [POST] /employees - สร้างพนักงานใหม่
@bp.route('/employees', methods=['POST'])
def create_employee():
    data = request.get_json()
    # เพิ่มการตรวจสอบข้อมูลที่จำเป็นให้ครบถ้วน
    required_fields = ['e_name', 'e_citizen_id_card', 'username', 'password', 'e_role', 'position']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400

    try:
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
            password=data['password'], # ในระบบจริงควร hash รหัสผ่าน!
            e_role=data['e_role'],
            position=data['position'],
            e_citizen_id_card=data['e_citizen_id_card'],
            e_email=data.get('e_email', ''),
            e_tel=data.get('e_tel', ''),
            e_gender=data.get('e_gender', 'Male'),
            e_citizen_address=data.get('e_citizen_address', ''),
            e_address=data.get('e_address', '')
        )
        db.session.add(new_employee)
        db.session.commit()
        return jsonify(new_employee.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'message': 'Username หรือ เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
        return jsonify({'message': str(e)}), 500

# [PUT] /employees/<id> - อัปเดตข้อมูลพนักงาน
@bp.route('/employees/<string:e_id>', methods=['PUT'])
def update_employee(e_id):
    employee = models.Employee.query.get_or_404(e_id)
    data = request.get_json()

    try:
        employee.e_name = data.get('e_name', employee.e_name)
        employee.e_role = data.get('e_role', employee.e_role)
        employee.position = data.get('position', employee.position)
        employee.e_email = data.get('e_email', employee.e_email)
        employee.e_tel = data.get('e_tel', employee.e_tel)
        
        # สำหรับรหัสผ่าน: จะอัปเดตต่อเมื่อมีการส่งรหัสใหม่มาเท่านั้น
        if data.get('password'):
            employee.password = data['password']

        db.session.commit()
        return jsonify(employee.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# [DELETE] /employees/<id> - ลบพนักงาน
@bp.route('/employees/<string:e_id>', methods=['DELETE'])
def delete_employee(e_id):
    employee = models.Employee.query.get_or_404(e_id)
    try:
        db.session.delete(employee)
        db.session.commit()
        return jsonify({'message': f'พนักงานรหัส {e_id} ถูกลบเรียบร้อยแล้ว'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    

# == Login Endpoint ==
@bp.route('/login', methods=['POST'])
def login():
    """Handles user login."""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'กรุณากรอก Username และ Password'}), 400

    username = data['username']
    password = data['password']

    # ค้นหา user จาก username
    employee = models.Employee.query.filter_by(username=username).first()

    # ตรวจสอบ user และ password (ในระบบจริงควรใช้การ hash password)
    if not employee or employee.password != password:
        return jsonify({'message': 'Username หรือ Password ไม่ถูกต้อง'}), 401

    # ถ้า login สำเร็จ
    # ในระบบจริงจะสร้าง token กลับไป แต่ตอนนี้ส่งแค่ข้อความยืนยัน
    return jsonify({
        'message': 'Login สำเร็จ',
        'user': { 'e_id': employee.e_id, 'e_name': employee.e_name, 'e_role': employee.e_role }
    })

# 5. API Endpoints for Sales Role
# ================================================

# --- Get all Purchase Orders ---
@bp.route('/purchaseorders', methods=['GET'])
def get_purchase_orders():
    try:
        # รับค่า filter ต่างๆ จาก URL query string
        status = request.args.get('status')
        search_name = request.args.get('name')
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')

        # เริ่มต้น query ทั้งหมด
        query = models.PurchaseOrder.query

        # --- Logic การกรองข้อมูล ---
        if status == 'unpaid':
            # กรองเฉพาะรายการที่ยังไม่จ่าย (สำหรับหน้าการเงิน)
            query = query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None]))

        if search_name:
            # ค้นหาจากชื่อเกษตรกร (ต้อง join กับตาราง Farmer)
            query = query.join(models.Farmer).filter(models.Farmer.f_name.ilike(f'%{search_name}%'))

        if start_date_str:
            # กรองตามวันที่เริ่มต้น
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
            query = query.filter(models.PurchaseOrder.b_date >= start_date)

        if end_date_str:
            # กรองตามวันที่สิ้นสุด
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            query = query.filter(models.PurchaseOrder.b_date <= end_date)

        # เรียงลำดับจากวันที่ล่าสุดไปเก่าสุดเสมอ
        orders = query.order_by(models.PurchaseOrder.b_date.desc()).all()

        return jsonify([order.to_dict() for order in orders])

    except Exception as e:
        print(f"Error in get_purchase_orders: {str(e)}")
        return jsonify({'message': str(e)}), 500
    
 # --- Create a new Purchase Order ---
@bp.route('/purchaseorders', methods=['POST'])
def create_purchase_order():
    data = request.get_json()
    # ตรวจสอบว่ามี f_id และ items (ที่เป็น list) ส่งมาหรือไม่
    if not data or not data.get('f_id') or not isinstance(data.get('items'), list) or not data.get('items'):
        return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ f_id และ items ที่เป็น array)'}), 400

    try:
        # --- สร้างเลขที่เอกสารอัตโนมัติ (เหมือนเดิม) ---
        last_order = models.PurchaseOrder.query.order_by(models.PurchaseOrder.purchase_order_number.desc()).first()
        if last_order and last_order.purchase_order_number.startswith('PO'):
            last_num = int(last_order.purchase_order_number[2:])
            new_po_number = f'PO{last_num + 1:03d}'
        else:
            new_po_number = 'PO001'

        # --- คำนวณราคารวมทั้งหมด ---
        total_price = sum(item['quantity'] * item['price_per_unit'] for item in data['items'])

        # สร้างใบสั่งซื้อหลัก
        new_order = models.PurchaseOrder(
            purchase_order_number=new_po_number,
            f_id=data['f_id'],
            b_total_price=total_price,
            b_date=datetime.utcnow(),
            payment_status='Unpaid'
        )
        db.session.add(new_order)

        # วนลูปสร้างรายการสินค้าย่อย
        for item_data in data['items']:
            order_item = models.PurchaseOrderItem(
                purchase_order_number=new_po_number,
                p_id=item_data['p_id'],
                quantity=item_data['quantity'],
                price_per_unit=item_data['price_per_unit']
            )
            db.session.add(order_item)
        
        db.session.commit()
        
        print(f"บันทึกรายการซื้อใหม่สำเร็จ: {new_po_number}")
        return jsonify(new_order.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print(f"เกิดข้อผิดพลาด: {str(e)}")
        return jsonify({'message': str(e)}), 500

# --- Get all Sales Orders ---
@bp.route('/salesorders', methods=['GET'])
def get_sales_orders():
    try:
        orders = models.SalesOrder.query.order_by(models.SalesOrder.s_date.desc()).all()
        # อย่าลืมเพิ่ม to_dict() ใน SalesOrder Model
        return jsonify([order.to_dict() for order in orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Get all Farmers ---
@bp.route('/farmers', methods=['GET'])
def get_farmers():
    try:
        farmers = models.Farmer.query.all()
        return jsonify([f.to_dict() for f in farmers])
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
# --- Create a new Farmer ---
@bp.route('/farmers', methods=['POST'])
def create_farmer():
    data = request.get_json()
    if not data or not data.get('f_name') or not data.get('f_citizen_id_card') or not data.get('f_tel'):
        return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ ชื่อ, เลขบัตรประชาชน, เบอร์โทร)'}), 400

    try:
        # --- สร้างรหัสเกษตรกรอัตโนมัติ (ตัวอย่าง) ---
        last_farmer = models.Farmer.query.order_by(models.Farmer.f_id.desc()).first()
        if last_farmer and last_farmer.f_id.startswith('F'):
            last_num = int(last_farmer.f_id[1:])
            new_id = f'F{last_num + 1:03d}'
        else:
            new_id = 'F001'

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

        print(f"ลงทะเบียนเกษตรกรใหม่สำเร็จ: {new_id} - {data['f_name']}")
        return jsonify(new_farmer.to_dict()), 201

    except Exception as e:
        db.session.rollback()
        print(f"เกิดข้อผิดพลาด: {str(e)}")
        # จัดการกับ Error กรณีเลขบัตรประชาชนซ้ำ
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'message': 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
        return jsonify({'message': 'เกิดข้อผิดพลาดฝั่งเซิร์ฟเวอร์'}), 500
    
# --- Get Warehouse Stock ---
@bp.route('/stock', methods=['GET'])
def get_stock_levels():
    try:
        all_stock = models.StockLevel.query.all()
        return jsonify([s.to_dict() for s in all_stock])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# --- Create a new Sales Order ---
@bp.route('/salesorders', methods=['POST'])
def create_sales_order():
    data = request.get_json()
    if not data or not data.get('p_id') or not data.get('f_id') or not data.get('s_quantity'):
        return jsonify({'message': 'Missing required data'}), 400
    
    try:
        # ในระบบจริงควรมีการสร้าง sale_order_number อัตโนมัติ
        new_order = models.SalesOrder(
            sale_order_number=data['sale_order_number'], 
            p_id=data['p_id'],
            f_id=data['f_id'],
            s_quantity=data['s_quantity'],
            s_total_price=data['s_total_price'],
            s_date=datetime.utcnow()
        )
        db.session.add(new_order)
        db.session.commit()
        return jsonify(new_order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
    # เพิ่มฟังก์ชันนี้ต่อท้ายไฟล์ routes.py

# backend/app/routes.py
@bp.route('/purchaseorders/<string:order_number>/pay', methods=['PUT'])
def mark_order_as_paid(order_number):
    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)

        if order.payment_status == 'Paid':
            return jsonify({'message': 'ใบเสร็จนี้ถูกประมวลผลไปแล้ว'}), 409

        # สมมติว่าของทั้งหมดเข้าคลังหลัก 'W001'
        main_warehouse = models.Warehouse.query.filter_by(warehouse_id='W001').first()
        if not main_warehouse:
            return jsonify({'message': 'ไม่พบคลังสินค้าหลัก (W001) ในระบบ'}), 500

        for item in order.items:
            # ค้นหาสต็อกของสินค้านี้ในคลังนี้โดยเฉพาะ
            stock_level = models.StockLevel.query.filter_by(
                p_id=item.p_id,
                warehouse_id=main_warehouse.warehouse_id
            ).first()

            if stock_level:
                # ถ้ามีอยู่แล้ว ให้อัปเดตจำนวน
                stock_level.quantity = (stock_level.quantity or 0) + item.quantity
            else:
                # ถ้ายังไม่มี ให้สร้างรายการสต็อกใหม่
                new_stock_level = models.StockLevel(
                    p_id=item.p_id,
                    warehouse_id=main_warehouse.warehouse_id,
                    quantity=item.quantity
                )
                db.session.add(new_stock_level)

            print(f"อัปเดตสต็อก: {item.p_id} ในคลัง {main_warehouse.warehouse_id} เพิ่มขึ้น {item.quantity}")

        order.payment_status = 'Paid'
        db.session.commit()
        return jsonify(order.to_dict())

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
    # --- API for Admin Dashboard Summary ---
@bp.route('/admin/dashboard-summary', methods=['GET'])
def get_admin_dashboard_summary():
    try:
        # --- 1. Key Metrics ---
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        # ยอดซื้อวันนี้
        purchase_today = db.session.query(func.sum(models.PurchaseOrder.b_total_price)).filter(models.PurchaseOrder.b_date >= today_start).scalar() or 0

        # จำนวนรายการที่ยังไม่จ่าย
        pending_payments_count = models.PurchaseOrder.query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None])).count()

        # จำนวนพนักงานและเกษตรกร
        employee_count = models.Employee.query.count()
        farmer_count = models.Farmer.query.count()

        # --- 2. Recent Activities ---
        recent_purchases = models.PurchaseOrder.query.order_by(models.PurchaseOrder.b_date.desc()).limit(5).all()

        # --- 3. Chart Data (ตัวอย่าง: ยอดซื้อ 7 วันย้อนหลัง) ---
        seven_days_ago = today_start - timedelta(days=6)
        purchase_by_day = db.session.query(
            func.date(models.PurchaseOrder.b_date),
            func.sum(models.PurchaseOrder.b_total_price)
        ).filter(models.PurchaseOrder.b_date >= seven_days_ago).group_by(func.date(models.PurchaseOrder.b_date)).all()

        # แปลงข้อมูลสำหรับกราฟ
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
        print(f"Error in dashboard summary: {str(e)}")
        return jsonify({'message': str(e)}), 500