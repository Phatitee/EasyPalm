# backend/app/routes.py

from flask import request, jsonify, Blueprint
from . import models
from . import db
from sqlalchemy import func
from datetime import datetime, timedelta

# 1. Blueprint Setup
# A Blueprint is a way to organize a group of related views and other code.
bp = Blueprint('main', __name__)


# ==============================================================================
#   UTILITY & AUTHENTICATION
# ==============================================================================

@bp.route('/')
def hello_world():
    """A simple welcome message to confirm the backend is running."""
    return 'EasyPalm Backend is running!'

@bp.route('/login', methods=['POST'])
def login():
    """Handles user login by verifying username and password."""
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'กรุณากรอก Username และ Password'}), 400

    username = data['username']
    password = data['password']

    # Find employee by username
    employee = models.Employee.query.filter_by(username=username).first()

    # Validate employee and password (Note: In a real system, passwords should be hashed)
    if not employee or employee.password != password:
        return jsonify({'message': 'Username หรือ Password ไม่ถูกต้อง'}), 401

    # On successful login, return user information
    # In a real system, a JWT token would be generated here.
    return jsonify({
        'message': 'Login สำเร็จ',
        'user': {'e_id': employee.e_id, 'e_name': employee.e_name, 'e_role': employee.e_role}
    })


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
    """Marks a purchase order as 'Paid' and updates stock levels."""
    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        if order.payment_status == 'Paid':
            return jsonify({'message': 'ใบเสร็จนี้ถูกประมวลผลไปแล้ว'}), 409
        
        # Assume main warehouse is W001
        main_warehouse_id = 'W001'
        if not models.Warehouse.query.get(main_warehouse_id):
            return jsonify({'message': f'ไม่พบคลังสินค้าหลัก ({main_warehouse_id}) ในระบบ'}), 500

        for item in order.items:
            stock_level = models.StockLevel.query.filter_by(
                p_id=item.p_id, warehouse_id=main_warehouse_id
            ).first()
            if stock_level:
                stock_level.quantity = (stock_level.quantity or 0) + item.quantity
            else:
                new_stock = models.StockLevel(
                    p_id=item.p_id, warehouse_id=main_warehouse_id, quantity=item.quantity
                )
                db.session.add(new_stock)
        
        order.payment_status = 'Paid'
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
#   SALES MANAGEMENT
# ==============================================================================

@bp.route('/salesorders', methods=['GET', 'POST'])
def handle_sales_orders():
    """Handles creating (POST) and retrieving (GET) sales orders with filtering."""
    
    # --- [POST] Create New Sales Order & Deduct Stock ---
    if request.method == 'POST':
        data = request.get_json()
        
        # *** ตรวจสอบว่ามี f_id (รหัสโรงงานลูกค้า) ถูกส่งมาหรือไม่ ***
        if not data or not data.get('food_industry_id') or not isinstance(data.get('items'), list) or not data['items']:
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน: ต้องระบุ food_industry_id และรายการสินค้า'}), 400
        
        # ตรวจสอบว่า Food Industry ID มีอยู่ในระบบหรือไม่
        if not models.FoodIndustry.query.get(data['food_industry_id']):
             return jsonify({'message': f"ไม่พบ Food Industry ID: {data['food_industry_id']}"}), 404

        try:
            # Check stock levels before proceeding (โค้ดเดิม)
            main_warehouse_id = 'W001'
            for item_data in data['items']:
                stock_level = models.StockLevel.query.filter_by(
                    p_id=item_data['p_id'], warehouse_id=main_warehouse_id
                ).first()
                if not stock_level or stock_level.quantity < float(item_data['quantity']):
                    try:
                        product = models.Product.query.get(item_data['p_id'])
                        product_name = product.p_name if product else item_data['p_id']
                    except AttributeError:
                        product_name = item_data['p_id']
                        
                    return jsonify({'message': f'สินค้า "{product_name}" มีไม่พอขาย! (คงเหลือ: {stock_level.quantity if stock_level else 0})'}), 400
            
            # Deduct stock (โค้ดเดิม)
            for item_data in data['items']:
                stock_level = models.StockLevel.query.filter_by(
                    p_id=item_data['p_id'], warehouse_id=main_warehouse_id
                ).first()
                stock_level.quantity -= float(item_data['quantity'])

            # Generate new SO number (โค้ดเดิม)
            last_order = models.SalesOrder.query.order_by(models.SalesOrder.sale_order_number.desc()).first()
            new_so_number = 'SO001'
            if last_order and last_order.sale_order_number.startswith('SO'):
                try:
                    last_num = int(last_order.sale_order_number[2:])
                    new_so_number = f'SO{last_num + 1:03d}'
                except ValueError:
                    pass # Fallback to SO001 if parsing fails
            
            total_price = sum(float(item['quantity']) * float(item['price_per_unit']) for item in data['items'])

            # *** สร้าง SalesOrder พร้อมบันทึก f_id ***
            new_order = models.SalesOrder(
                sale_order_number=new_so_number,
                food_industry_id=data['food_industry_id'], # <<< บันทึกรหัสโรงงานลูกค้าที่นี่
                s_total_price=total_price,
                s_date=datetime.utcnow()
            )
            db.session.add(new_order)
            
            # Create SalesOrderItem (โค้ดเดิม)
            for item_data in data['items']:
                order_item = models.SalesOrderItem(
                    sale_order_number=new_so_number,
                    p_id=item_data['p_id'],
                    quantity=item_data['quantity'],
                    price_per_unit=item_data['price_per_unit']
                )
                db.session.add(order_item)
            
            db.session.commit()
            return jsonify(new_order.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error creating sales order: {e}")
            return jsonify({'message': f'เกิดข้อผิดพลาดในการบันทึกใบขาย: {str(e)}'}), 500
    
    # --- [GET] Get All Sales Orders with Filters (โค้ดเดิมที่ปรับปรุงในรอบก่อน) ---
    else:
        try:
            # Query for SalesOrder and join with FoodIndustry and fetch items
            query = db.session.query(
                models.SalesOrder, 
                models.FoodIndustry.F_name.label('food_industry_name')
            ).join(
                models.FoodIndustry, 
                models.FoodIndustry.F_id == models.SalesOrder.f_id
            )
            
            # Apply Filters (ค้นหาตามชื่อลูกค้า)
            if search_name := request.args.get('name'):
                query = query.filter(models.FoodIndustry.F_name.ilike(f'%{search_name}%'))
            
            if start_date_str := request.args.get('start_date'):
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d')
                query = query.filter(models.SalesOrder.s_date >= start_date)
            
            if end_date_str := request.args.get('end_date'):
                # Include the entire end date
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d') + timedelta(days=1)
                query = query.filter(models.SalesOrder.s_date < end_date)

            orders_with_names = query.order_by(models.SalesOrder.s_date.desc()).all()
            
            # Format results and fetch items
            results = []
            for order, food_industry_name in orders_with_names:
                order_dict = order.to_dict()
                order_dict['food_industry_name'] = food_industry_name
                
                # Fetch Order Items
                items_query = db.session.query(
                    models.SalesOrderItem,
                    models.Product.p_name.label('product_name')
                ).join(
                    models.Product, 
                    models.Product.p_id == models.SalesOrderItem.p_id
                ).filter(
                    models.SalesOrderItem.sale_order_number == order.sale_order_number
                ).all()

                order_dict['items'] = [{**item.to_dict(), 'product_name': product_name} for item, product_name in items_query]

                results.append(order_dict)

            return jsonify(results)
        except Exception as e:
            # Use 500 server error for unexpected errors
            print(f"Error getting sales orders: {e}")
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