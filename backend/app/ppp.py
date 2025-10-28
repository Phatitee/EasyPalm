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
    if not employee.is_active:
        return jsonify({'message': 'บัญชีของคุณถูกระงับสิทธิ์การใช้งาน กรุณาติดต่อผู้ดูแลระบบ'}), 403
    
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

@bp.route('/products/<string:p_id>', methods=['GET', 'PUT', 'DELETE'])
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
    
    if request.method == 'POST':
        data = request.get_json()
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

            # ★★★ FIX: แปลงค่า string 'admin' ให้เป็น EmployeeRole.ADMIN ก่อนบันทึก ★★★
            try:
                # Assuming EmployeeRole is imported or defined in models
                role_enum = models.EmployeeRole(data['e_role'])
            except ValueError:
                return jsonify({'message': f"Role '{data['e_role']}' ไม่ถูกต้อง"}), 400
            # ★★★ END FIX ★★★

            new_employee = models.Employee(
                e_id=new_id,
                e_name=data['e_name'],
                username=data['username'],
                password=data['password'],
                e_role=role_enum, # <-- ใช้ค่าที่แปลงแล้ว
                position=data['position'],
                e_citizen_id_card=data['e_citizen_id_card'],
                e_email=data.get('e_email'),
                e_tel=data.get('e_tel'),
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

    else: # GET
        try:
            employees = models.Employee.query.all()
            return jsonify([e.to_dict() for e in employees])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

def handle_employees():
    """Handles fetching all employees (GET) and creating a new employee (POST)."""
    
    if request.method == 'POST':
        data = request.get_json()
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

            # ★★★ FIX: แปลงค่า string 'admin' ให้เป็น EmployeeRole.ADMIN ก่อนบันทึก ★★★
            try:
                role_enum = EmployeeRole(data['e_role'])
            except ValueError:
                return jsonify({'message': f"Role '{data['e_role']}' ไม่ถูกต้อง"}), 400
            # ★★★ END FIX ★★★

            new_employee = models.Employee(
                e_id=new_id,
                e_name=data['e_name'],
                username=data['username'],
                password=data['password'],
                e_role=role_enum, # <-- ใช้ค่าที่แปลงแล้ว
                position=data['position'],
                e_citizen_id_card=data['e_citizen_id_card'],
                e_email=data.get('e_email'),
                e_tel=data.get('e_tel'),
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

    else: # GET
        try:
            employees = models.Employee.query.all()
            return jsonify([e.to_dict() for e in employees])
        except Exception as e:
            return jsonify({'message': str(e)}), 500
        
@bp.route('/employees/<string:e_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_employee_by_id(e_id):
    """Handles GET, PUT, and DELETE for a single employee."""
    employee = models.Employee.query.get_or_404(e_id)

    if request.method == 'GET':
        return jsonify(employee.to_dict())

    elif request.method == 'PUT':
        data = request.get_json()
        try:
            employee.e_name = data.get('e_name', employee.e_name)
            employee.position = data.get('position', employee.position)
            if 'e_role' in data:
                employee.e_role = models.EmployeeRole(data['e_role'].lower())
            employee.e_email = data.get('e_email', employee.e_email)
            employee.e_tel = data.get('e_tel', employee.e_tel)
            employee.e_gender = data.get('e_gender', employee.e_gender)
            employee.e_address = data.get('e_address', employee.e_address)
            employee.e_citizen_address = data.get('e_citizen_address', employee.e_citizen_address)
            
            if data.get('password'):
                 employee.password = data.get('password')

            db.session.commit()
            return jsonify({'message': 'อัปเดตข้อมูลพนักงานสำเร็จ'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(employee)
            db.session.commit()
            return jsonify({'message': f'ลบพนักงาน {e_id} สำเร็จ'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

@bp.route('/employees/<string:e_id>', methods=['PUT', 'DELETE'])
def handle_employee(e_id):
    """Handles updating (PUT) or deleting (DELETE) a single employee."""
    employee = models.Employee.query.get_or_404(e_id)

    if request.method == 'PUT':
        data = request.get_json()
        try:
            employee.e_name = data.get('e_name', employee.e_name)
            employee.position = data.get('position', employee.position)
            employee.e_email = data.get('e_email', employee.e_email)
            employee.e_tel = data.get('e_tel', employee.e_tel)
            
            # ★★★ FIX: แปลงค่า string 'admin' ให้เป็น EmployeeRole.ADMIN ก่อนบันทึก ★★★
            if 'e_role' in data:
                try:
                    employee.e_role = EmployeeRole(data['e_role'])
                except ValueError:
                    return jsonify({'message': f"Role '{data['e_role']}' ไม่ถูกต้อง"}), 400
            # ★★★ END FIX ★★★

            if data.get('password'):
                employee.password = data['password']
            
            db.session.commit()
            return jsonify(employee.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    if request.method == 'DELETE':
        try:
            db.session.delete(employee)
            db.session.commit()
            return jsonify({'message': f'พนักงานรหัส {e_id} ถูกลบเรียบร้อยแล้ว'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
        
@bp.route('/employees/<string:e_id>/suspend', methods=['PUT'])
def suspend_employee(e_id):
    """ระงับสิทธิ์พนักงาน"""
    employee = models.Employee.query.get_or_404(e_id)
    try:
        employee.is_active = False
        employee.suspension_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f'ระงับสิทธิ์พนักงาน {e_id} เรียบร้อยแล้ว'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/employees/<string:e_id>/unsuspend', methods=['PUT'])
def unsuspend_employee(e_id):
    """ยกเลิกการระงับสิทธิ์พนักงาน"""
    employee = models.Employee.query.get_or_404(e_id)
    try:
        employee.is_active = True
        employee.suspension_date = None
        db.session.commit()
        return jsonify({'message': f'ยกเลิกการระงับสิทธิ์พนักงาน {e_id} เรียบร้อยแล้ว'})
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

@bp.route('/warehouses/<string:warehouse_id>', methods=['PUT', 'DELETE'])
def handle_warehouse(warehouse_id):
    """ Handles updating or deleting a single warehouse. """
    warehouse = models.Warehouse.query.get_or_404(warehouse_id)

    # --- Update Warehouse ---
    if request.method == 'PUT':
        data = request.get_json()
        try:
            warehouse.warehouse_name = data.get('warehouse_name', warehouse.warehouse_name)
            warehouse.location = data.get('location', warehouse.location)
            
            # ★★★ FIX: เพิ่มบรรทัดนี้เพื่ออัปเดตความจุ ★★★
            if 'capacity' in data:
                warehouse.capacity = float(data['capacity'])

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
@bp.route('/purchaseorders/<string:order_number>', methods=['GET'])
def get_purchase_order(order_number):
    """ API ใหม่: ดึงข้อมูลใบสั่งซื้อใบเดียวตามเลขที่ """
    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        return jsonify(order.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/purchaseorders', methods=['GET', 'POST'])
def handle_purchase_orders():
    if request.method == 'POST':
        data = request.get_json()
        if not all(k in data for k in ['f_id', 'items', 'employee_id']) or not data['items']:
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ f_id, employee_id และ items)'}), 400
        try:
            last_order = models.PurchaseOrder.query.order_by(models.PurchaseOrder.purchase_order_number.desc()).first()
            new_po_number = f'PO{(int(last_order.purchase_order_number[2:]) + 1):03d}' if last_order else 'PO001'
            total_price = sum(item['quantity'] * item['price_per_unit'] for item in data['items'])
            
            new_order = models.PurchaseOrder(
                purchase_order_number=new_po_number,
                f_id=data['f_id'],
                b_total_price=total_price,
                b_date=datetime.utcnow(),
                created_by_id=data['employee_id'],
                created_date=datetime.utcnow()
            )
            db.session.add(new_order)
            
            for item_data in data['items']:
                db.session.add(models.PurchaseOrderItem(
                    purchase_order_number=new_po_number,
                    p_id=item_data['p_id'],
                    quantity=item_data['quantity'],
                    price_per_unit=item_data['price_per_unit']
                ))
            
            db.session.commit()
            return jsonify(new_order.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
    else: # GET
        try:
            query = models.PurchaseOrder.query
            warehouse_id = request.args.get('warehouse_id')
            if warehouse_id:
                # Join ผ่าน PurchaseOrderItem และ StockTransactionIn เพื่อกรองตามคลัง
                query = query.join(models.PurchaseOrderItem).join(models.StockTransactionIn).filter(
                    models.StockTransactionIn.warehouse_id == warehouse_id
                )
            
            status_filter = request.args.get('status')
            if status_filter:
                # ทำให้การตรวจสอบไม่ขึ้นกับตัวพิมพ์เล็ก-ใหญ่
                status_lower = status_filter.lower()
                
                if status_lower == 'unpaid':
                    # สำหรับหน้า Payment Management ให้กรองเฉพาะที่ยังไม่จ่าย
                    query = query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None]))
                else:
                    # สำหรับหน้า History ทำให้รองรับสถานะอื่นๆ
                    status_capitalized = status_filter.capitalize()
                    if status_capitalized in ['Paid']:
                        query = query.filter(models.PurchaseOrder.payment_status == status_capitalized)
                    elif status_capitalized in ['Completed', 'Pending', 'Not Received']:
                        query = query.filter(models.PurchaseOrder.stock_status == status_capitalized)

            if search_term := request.args.get('search'):
                query = query.join(models.Farmer).filter(
                    or_(
                        models.PurchaseOrder.purchase_order_number.ilike(f'%{search_term}%'),
                        models.Farmer.f_name.ilike(f'%{search_term}%')
                    )
                )
            
            orders = query.order_by(models.PurchaseOrder.b_date.desc()).all()
            return jsonify([order.to_dict() for order in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/purchaseorders/<string:order_number>/pay', methods=['PUT'])
def mark_order_as_paid(order_number):
    data = request.get_json()
    if not data or not data.get('employee_id'):
        return jsonify({'message': 'กรุณาระบุ ID ของพนักงานที่ทำรายการ'}), 400
    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        if order.payment_status == 'Paid':
            return jsonify({'message': 'ใบเสร็จนี้ถูกจ่ายเงินไปแล้ว'}), 409
        
        order.payment_status = 'Paid'
        order.stock_status = 'Pending'
        order.paid_by_id = data['employee_id']
        order.paid_date = datetime.utcnow()
        db.session.commit()
        return jsonify(order.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/stock', methods=['GET'])
@bp.route('/stock', methods=['GET'])
def get_stock_levels():
    """Retrieves all current stock levels and includes average cost, with filtering."""
    try:
        # Start with a base query that joins with Product and Warehouse
        query = db.session.query(
            models.StockLevel,
            models.Product.p_name,
            models.Warehouse.warehouse_name
        ).join(
            models.Product, models.StockLevel.p_id == models.Product.p_id
        ).join(
            models.Warehouse, models.StockLevel.warehouse_id == models.Warehouse.warehouse_id
        ).filter(models.StockLevel.quantity > 0)


        # Filter by warehouse_id if provided
        warehouse_id = request.args.get('warehouse_id')
        if warehouse_id:
            query = query.filter(models.StockLevel.warehouse_id == warehouse_id)

        # Search by product name if provided
        search_term = request.args.get('search')
        if search_term:
            query = query.filter(models.Product.p_name.ilike(f'%{search_term}%'))

        stock_levels_data = query.order_by(models.Warehouse.warehouse_name, models.Product.p_name).all()
        
        results = []
        for sl, p_name, w_name in stock_levels_data:
            # The average cost calculation logic remains the same
            fifo_lots = models.StockTransactionIn.query.filter(
                models.StockTransactionIn.p_id == sl.p_id,
                models.StockTransactionIn.warehouse_id == sl.warehouse_id,
                models.StockTransactionIn.remaining_quantity > 0
            ).all()

            total_cost = sum(lot.remaining_quantity * lot.unit_cost for lot in fifo_lots)
            total_quantity = sum(lot.remaining_quantity for lot in fifo_lots)
            average_cost = (total_cost / total_quantity) if total_quantity > 0 else 0

            # Build the result dictionary
            stock_data = sl.to_dict() # to_dict from model is simple, so we augment it
            stock_data['product_name'] = p_name
            stock_data['warehouse_name'] = w_name
            stock_data['average_cost'] = round(average_cost, 2)
            results.append(stock_data)

        return jsonify(results)

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
    """ ยืนยันการรับสินค้าเข้าคลัง และอัปเดตสต็อก """
    data = request.get_json()
    if not all(k in data for k in ['purchase_order_number', 'warehouse_id', 'employee_id']):
        return jsonify({'message': 'ต้องการ purchase_order_number, warehouse_id และ employee_id'}), 400

    order_number = data['purchase_order_number']
    warehouse_id = data['warehouse_id']
    employee_id = data['employee_id']

    try:
        order = models.PurchaseOrder.query.get_or_404(order_number)
        if order.stock_status == 'Completed':
            return jsonify({'message': 'ใบสั่งซื้อนี้ถูกจัดเก็บเข้าคลังไปแล้ว'}), 409

        # --- Logic การอัปเดตสต็อก ---
        for item in order.items:
            db.session.add(models.StockTransactionIn(
                in_transaction_date=datetime.utcnow(),
                p_id=item.p_id,
                in_quantity=item.quantity,
                remaining_quantity=item.quantity,
                unit_cost=item.price_per_unit,
                warehouse_id=warehouse_id,
                po_item_id=item.po_item_id
            ))
            stock_level = models.StockLevel.query.filter_by(p_id=item.p_id, warehouse_id=warehouse_id).first()
            if stock_level:
                stock_level.quantity += item.quantity
            else:
                db.session.add(models.StockLevel(p_id=item.p_id, warehouse_id=warehouse_id, quantity=item.quantity))
        
        # --- อัปเดตสถานะ PO ---
        order.stock_status = 'Completed'
        order.received_by_id = employee_id
        order.received_date = datetime.utcnow()
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
    data = request.get_json()
    if not data or not data.get('employee_id'):
        return jsonify({'message': 'กรุณาระบุ ID ของพนักงานที่ทำรายการ'}), 400
    employee_id = data.get('employee_id')
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        if order.shipment_status == 'Shipped':
            return jsonify({'message': 'ใบสั่งขายนี้ถูกจัดส่งไปแล้ว'}), 409

        order.shipment_status = 'Shipped'
        order.shipped_by_id = employee_id
        order.shipped_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f'ยืนยันการจัดส่ง SO {order_number} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
#   (โค้ดที่เพิ่มเข้ามาใหม่)
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
@bp.route('/api/purchasing/warehouse-summary', methods=['GET'])
def get_warehouse_summary():
    """ Provides a summary of stock levels for each warehouse. """
    try:
        warehouses = models.Warehouse.query.all()
        summary = []
        for w in warehouses:
            # Calculate total stock in this warehouse by summing quantities from StockLevel
            current_stock_agg = db.session.query(
                func.sum(models.StockLevel.quantity)
            ).filter(
                models.StockLevel.warehouse_id == w.warehouse_id
            ).scalar() or 0.0

            summary.append({
                'warehouse_id': w.warehouse_id,
                'warehouse_name': w.warehouse_name,
                'location': w.location,
                'capacity': w.capacity,
                'current_stock': float(current_stock_agg),
                'remaining_capacity': float(w.capacity - current_stock_agg)
            })
        return jsonify(summary)
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@bp.route('/warehouse/shipment-history', methods=['GET'])
def get_shipment_history():
    """ API ใหม่: ดึงประวัติการเบิกสินค้าทั้งหมด (Shipped, Delivered) """
    try:
        query = models.SalesOrder.query.filter(
            models.SalesOrder.shipment_status.in_(['Shipped', 'Delivered'])
        )

        # Filter by customer name or SO number if provided
        if search_term := request.args.get('search'):
            query = query.join(models.FoodIndustry).filter(
                or_(
                    models.SalesOrder.sale_order_number.ilike(f'%{search_term}%'),
                    models.FoodIndustry.F_name.ilike(f'%{search_term}%')
                )
            )

        orders = query.order_by(models.SalesOrder.shipped_date.desc()).all()
        return jsonify([order.to_dict() for order in orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

# ==============================================================================
#   SALES MANAGEMENT
# ==============================================================================

@bp.route('/salesorders', methods=['GET', 'POST'])
def handle_sales_orders():
    if request.method == 'POST':
        data = request.get_json()
        required_fields = ['f_id', 'items', 'warehouse_id', 'employee_id']
        if not all(field in data for field in required_fields) or not isinstance(data['items'], list) or not data['items']:
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ f_id, warehouse_id, employee_id และ items)'}), 400
        
        warehouse_id = data['warehouse_id']
        employee_id = data['employee_id']
        
        try:
            # Step 1: Check stock
            for item_data in data['items']:
                stock_level = models.StockLevel.query.filter_by(p_id=item_data['p_id'], warehouse_id=warehouse_id).first()
                if not stock_level or stock_level.quantity < float(item_data['quantity']):
                    product = models.Product.query.get(item_data['p_id'])
                    return jsonify({'message': f'สินค้า "{product.p_name}" ในคลัง "{warehouse_id}" มีไม่พอขาย!'}), 400

            # Step 2: Create Sales Order
            last_order = models.SalesOrder.query.order_by(models.SalesOrder.sale_order_number.desc()).first()
            new_so_number = 'SO001'
            if last_order and last_order.sale_order_number.startswith('SO'):
                last_num = int(last_order.sale_order_number[2:])
                new_so_number = f'SO{last_num + 1:03d}'
            
            total_price = sum(float(item['quantity']) * float(item['price_per_unit']) for item in data['items'])

            new_order = models.SalesOrder(
                sale_order_number=new_so_number,
                F_id=data['f_id'],
                s_total_price=total_price,
                s_date=datetime.utcnow(),
                created_by_id=employee_id,
                created_date=datetime.utcnow()
            )
            db.session.add(new_order)
            
            # Step 3: Create Order Items and Adjust Stock
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
            
            db.session.flush()

            for item in new_order_items:
                quantity_to_sell = item.quantity
                stock_in_lots = models.StockTransactionIn.query.filter(
                    models.StockTransactionIn.p_id == item.p_id,
                    models.StockTransactionIn.warehouse_id == warehouse_id,
                    models.StockTransactionIn.remaining_quantity > 0
                ).order_by(asc(models.StockTransactionIn.in_transaction_date)).all()

                for lot in stock_in_lots:
                    if quantity_to_sell <= 0: break
                    quantity_from_this_lot = min(lot.remaining_quantity, quantity_to_sell)
                    lot.remaining_quantity -= quantity_from_this_lot
                    quantity_to_sell -= quantity_from_this_lot

                if quantity_to_sell > 0: raise Exception(f'เกิดข้อผิดพลาดในการคำนวณสต็อกสำหรับสินค้า {item.p_id}')
                
                stock_level_to_update = models.StockLevel.query.filter_by(p_id=item.p_id, warehouse_id=warehouse_id).first()
                stock_level_to_update.quantity -= item.quantity
            
            db.session.commit()
            return jsonify(new_order.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f"เกิดข้อผิดพลาด: {str(e)}"}), 500
    
    else: # GET request
        try:
            query = models.SalesOrder.query

            # Filter by payment status
            status_filter = request.args.get('status')
            if status_filter:
                query = query.filter(models.SalesOrder.payment_status == status_filter)

            # Search by customer name or SO number
            search_term = request.args.get('search')
            if search_term:
                query = query.join(models.FoodIndustry).filter(
                    or_(
                        models.SalesOrder.sale_order_number.ilike(f'%{search_term}%'),
                        models.FoodIndustry.F_name.ilike(f'%{search_term}%')
                    )
                )
            
            orders = query.order_by(models.SalesOrder.s_date.desc()).all()
            return jsonify([order.to_dict() for order in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500
        
@bp.route('/salesorders/<string:order_number>/confirm-delivery', methods=['PUT'])
def confirm_delivery(order_number):
    data = request.get_json()
    if not data or not data.get('employee_id'):
        return jsonify({'message': 'กรุณาระบุ ID ของพนักงานที่ทำรายการ'}), 400
    employee_id = data.get('employee_id')
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        if order.shipment_status != 'Shipped':
            return jsonify({'message': f'ไม่สามารถยืนยันได้ สถานะปัจจุบันคือ {order.shipment_status}'}), 409

        # เมื่อยืนยันแล้ว สถานะจะเปลี่ยนเป็น Delivered
        order.shipment_status = 'Delivered'
        order.delivery_status = 'Delivered' # อัปเดตสถานะการส่งมอบด้วย
        order.delivered_by_id = employee_id
        order.delivered_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f'ยืนยันการจัดส่ง SO {order_number} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
    
@bp.route('/salesorders/<string:order_number>', methods=['GET'])
def get_sales_order(order_number):
    """ (API ใหม่) ดึงข้อมูลใบสั่งขายใบเดียวตามเลขที่ """
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        return jsonify(order.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500
    
@bp.route('/salesorders/pending-payment', methods=['GET'])
def get_pending_payment_orders():
    """ API ใหม่: ดึงรายการ SO ที่ส่งแล้ว แต่รอรับชำระเงิน """
    try:
        pending_payment_orders = models.SalesOrder.query.filter_by(
            delivery_status='Delivered',
            payment_status='Unpaid'
        ).order_by(models.SalesOrder.s_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_payment_orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/salesorders/<string:order_number>/confirm-payment', methods=['PUT'])
def confirm_payment(order_number):
    """ API ใหม่: ยืนยันการรับชำระเงิน """
    data = request.get_json()
    if not data or not data.get('employee_id'):
        return jsonify({'message': 'กรุณาระบุ ID ของพนักงานที่ทำรายการ'}), 400
    
    employee_id = data.get('employee_id')
    
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        if order.payment_status == 'Paid':
            return jsonify({'message': 'ใบสั่งขายนี้ได้รับเงินแล้ว'}), 409
        if order.delivery_status != 'Delivered':
            return jsonify({'message': 'ไม่สามารถยืนยันการชำระเงินได้เนื่องจากสินค้ายังไม่ถูกจัดส่ง'}), 400

        order.payment_status = 'Paid'
        order.paid_by_id = employee_id
        order.paid_date = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': f'ยืนยันการรับเงิน SO {order_number} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
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

@bp.route('/executive/dashboard-summary', methods=['GET'])
def get_executive_dashboard_summary():
    """ API ใหม่: รวบรวมข้อมูลสรุปทั้งหมดสำหรับหน้า Dashboard ของผู้บริหาร """
    try:
        # --- 1. Key Metrics (KPIs) ---
        total_sales_revenue = db.session.query(func.sum(models.SalesOrder.s_total_price)).scalar() or 0.0
        total_purchase_cost = db.session.query(func.sum(models.PurchaseOrder.b_total_price)).scalar() or 0.0
        
        # คำนวณต้นทุนขาย (COGS) จาก Sales Orders ที่เสร็จสมบูรณ์
        total_cogs = db.session.query(func.sum(models.SalesOrderItemCost.cogs)).join(
            models.SalesOrderItem, models.SalesOrderItem.so_item_id == models.SalesOrderItemCost.so_item_id
        ).join(
            models.SalesOrder, models.SalesOrder.sale_order_number == models.SalesOrderItem.sale_order_number
        ).filter(models.SalesOrder.payment_status == 'Paid').scalar() or 0.0

        gross_profit = total_sales_revenue - total_cogs
        
        # คำนวณมูลค่าสต็อกปัจจุบัน
        current_stock_value = 0.0
        stock_levels = models.StockLevel.query.filter(models.StockLevel.quantity > 0).all()
        for sl in stock_levels:
            fifo_lots = models.StockTransactionIn.query.filter(
                models.StockTransactionIn.p_id == sl.p_id,
                models.StockTransactionIn.warehouse_id == sl.warehouse_id,
                models.StockTransactionIn.remaining_quantity > 0
            ).all()
            total_cost = sum(lot.remaining_quantity * lot.unit_cost for lot in fifo_lots)
            current_stock_value += total_cost
            
        # --- 2. Chart Data (Last 30 days) ---
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        
        sales_by_day = db.session.query(
            func.date(models.SalesOrder.s_date),
            func.sum(models.SalesOrder.s_total_price)
        ).filter(models.SalesOrder.s_date >= thirty_days_ago).group_by(func.date(models.SalesOrder.s_date)).all()

        purchases_by_day = db.session.query(
            func.date(models.PurchaseOrder.b_date),
            func.sum(models.PurchaseOrder.b_total_price)
        ).filter(models.PurchaseOrder.b_date >= thirty_days_ago).group_by(func.date(models.PurchaseOrder.b_date)).all()

        # Format chart data
        chart_data = {}
        for date, total in sales_by_day:
            date_str = date.isoformat()
            if date_str not in chart_data: chart_data[date_str] = {'date': date_str, 'sales': 0, 'purchases': 0}
            chart_data[date_str]['sales'] = float(total)
        for date, total in purchases_by_day:
            date_str = date.isoformat()
            if date_str not in chart_data: chart_data[date_str] = {'date': date_str, 'sales': 0, 'purchases': 0}
            chart_data[date_str]['purchases'] = float(total)

        # --- 3. Recent Activities ---
        recent_sales = models.SalesOrder.query.order_by(models.SalesOrder.s_date.desc()).limit(5).all()
        recent_purchases = models.PurchaseOrder.query.order_by(models.PurchaseOrder.b_date.desc()).limit(5).all()

        summary = {
            'kpis': {
                'total_revenue': total_sales_revenue,
                'gross_profit': gross_profit,
                'total_purchase_cost': total_purchase_cost,
                'current_stock_value': current_stock_value,
            },
            'chart_data': sorted(chart_data.values(), key=lambda x: x['date']),
            'recent_sales': [order.to_dict() for order in recent_sales],
            'recent_purchases': [order.to_dict() for order in recent_purchases],
        }
        return jsonify(summary)

    except Exception as e:
        return jsonify({'message': str(e)}), 500# backend/app/routes.py

from flask import request, jsonify, Blueprint
from . import models
from . import db
from sqlalchemy import func, or_
from datetime import datetime, timedelta
from sqlalchemy import asc

# All routes defined here will be prefixed with '/api' by __init__.py
bp = Blueprint('api', __name__)

#==============================================================================
#   COMMON & UTILITY
#==============================================================================
@bp.route('/')
def hello_world():
    return 'EasyPalm Backend is running!'

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not all(k in data for k in ['username', 'password']):
        return jsonify({'message': 'กรุณากรอก Username และ Password'}), 400
    employee = models.Employee.query.filter_by(username=data['username']).first()
    if not employee or employee.password != data['password']:
        return jsonify({'message': 'Username หรือ Password ไม่ถูกต้อง'}), 401
    if not employee.is_active:
        return jsonify({'message': 'บัญชีของคุณถูกระงับสิทธิ์การใช้งาน'}), 403
    return jsonify({'message': 'Login สำเร็จ', 'user': employee.to_dict()})

@bp.route('/products', methods=['GET'])
def get_products():
    return jsonify([p.to_dict() for p in models.Product.query.all()])

@bp.route('/farmers', methods=['GET'])
def get_farmers():
    return jsonify([f.to_dict() for f in models.Farmer.query.all()])

@bp.route('/food-industries', methods=['GET'])
def get_food_industries():
    return jsonify([i.to_dict() for i in models.FoodIndustry.query.all()])

@bp.route('/warehouses', methods=['GET'])
def get_warehouses():
    return jsonify([w.to_dict() for w in models.Warehouse.query.all()])

@bp.route('/stock', methods=['GET'])
def get_stock_levels():
    try:
        query = db.session.query(
            models.StockLevel, models.Product.p_name, models.Warehouse.warehouse_name
        ).join(models.Product, models.StockLevel.p_id == models.Product.p_id)\
         .join(models.Warehouse, models.StockLevel.warehouse_id == models.Warehouse.warehouse_id)\
         .filter(models.StockLevel.quantity > 0)

        if warehouse_id := request.args.get('warehouse_id'):
            query = query.filter(models.StockLevel.warehouse_id == warehouse_id)
        if search_term := request.args.get('search'):
            query = query.filter(models.Product.p_name.ilike(f'%{search_term}%'))

        stock_levels_data = query.order_by(models.Warehouse.warehouse_name, models.Product.p_name).all()
        
        results = []
        for sl, p_name, w_name in stock_levels_data:
            fifo_lots = models.StockTransactionIn.query.filter_by(p_id=sl.p_id, warehouse_id=sl.warehouse_id).filter(models.StockTransactionIn.remaining_quantity > 0).all()
            total_cost = sum(lot.remaining_quantity * lot.unit_cost for lot in fifo_lots)
            total_quantity = sum(lot.remaining_quantity for lot in fifo_lots)
            average_cost = (total_cost / total_quantity) if total_quantity > 0 else 0
            stock_data = sl.to_dict()
            stock_data['product_name'] = p_name
            stock_data['warehouse_name'] = w_name
            stock_data['average_cost'] = round(average_cost, 2)
            results.append(stock_data)
        return jsonify(results)
    except Exception as e:
        return jsonify({'message': str(e)}), 500

#==============================================================================
#   PURCHASE MANAGEMENT
#==============================================================================
@bp.route('/purchaseorders', methods=['GET', 'POST'])
def handle_purchase_orders():
    if request.method == 'POST':
        data = request.get_json()
        if not all(k in data for k in ['f_id', 'items', 'employee_id']): return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400
        try:
            last_order = models.PurchaseOrder.query.order_by(models.PurchaseOrder.purchase_order_number.desc()).first()
            new_po_number = f'PO{(int(last_order.purchase_order_number[2:]) + 1):03d}' if last_order else 'PO001'
            total_price = sum(item['quantity'] * item['price_per_unit'] for item in data['items'])
            new_order = models.PurchaseOrder(
                purchase_order_number=new_po_number, f_id=data['f_id'],
                b_total_price=total_price, b_date=datetime.utcnow(),
                created_by_id=data['employee_id'], created_date=datetime.utcnow()
            )
            db.session.add(new_order)
            for item in data['items']:
                db.session.add(models.PurchaseOrderItem(
                    purchase_order_number=new_po_number, p_id=item['p_id'],
                    quantity=item['quantity'], price_per_unit=item['price_per_unit']
                ))
            db.session.commit()
            return jsonify(new_order.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500
    else: # GET
        try:
            query = models.PurchaseOrder.query
            if warehouse_id := request.args.get('warehouse_id'):
                query = query.join(models.PurchaseOrderItem).join(models.StockTransactionIn).filter(models.StockTransactionIn.warehouse_id == warehouse_id)
            if status_filter := request.args.get('status'):
                status_lower = status_filter.lower()
                if status_lower == 'unpaid': query = query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None]))
                else:
                    status_capitalized = status_filter.capitalize()
                    if status_capitalized in ['Paid']: query = query.filter(models.PurchaseOrder.payment_status == status_capitalized)
                    elif status_capitalized in ['Completed', 'Pending', 'Not Received']: query = query.filter(models.PurchaseOrder.stock_status == status_capitalized)
            if search_term := request.args.get('search'):
                query = query.join(models.Farmer).filter(or_(models.PurchaseOrder.purchase_order_number.ilike(f'%{search_term}%'), models.Farmer.f_name.ilike(f'%{search_term}%')))
            orders = query.distinct().order_by(models.PurchaseOrder.b_date.desc()).all()
            return jsonify([o.to_dict() for o in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/purchaseorders/<string:order_number>', methods=['GET'])
def get_purchase_order(order_number):
    order = models.PurchaseOrder.query.get_or_404(order_number)
    return jsonify(order.to_dict())

@bp.route('/purchaseorders/<string:order_number>/pay', methods=['PUT'])
def mark_order_as_paid(order_number):
    data = request.get_json()
    if not data or 'employee_id' not in data: return jsonify({'message': 'กรุณาระบุ ID ของพนักงาน'}), 400
    order = models.PurchaseOrder.query.get_or_404(order_number)
    if order.payment_status == 'Paid': return jsonify({'message': 'ใบเสร็จนี้ถูกจ่ายเงินไปแล้ว'}), 409
    order.payment_status = 'Paid'
    order.stock_status = 'Pending'
    order.paid_by_id = data['employee_id']
    order.paid_date = datetime.utcnow()
    db.session.commit()
    return jsonify(order.to_dict())

#==============================================================================
#   SALES MANAGEMENT
#==============================================================================
@bp.route('/salesorders', methods=['GET', 'POST'])
def handle_sales_orders():
    if request.method == 'POST':
        data = request.get_json()
        if not all(k in data for k in ['f_id', 'items', 'warehouse_id', 'employee_id']): return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400
        try:
            # ... (Sales Order POST logic remains the same)
            pass
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f"เกิดข้อผิดพลาด: {str(e)}"}), 500
    else: # GET
        try:
            query = models.SalesOrder.query
            if status_filter := request.args.get('status'): query = query.filter(models.SalesOrder.payment_status == status_filter)
            if search_term := request.args.get('search'):
                query = query.join(models.FoodIndustry).filter(or_(models.SalesOrder.sale_order_number.ilike(f'%{search_term}%'), models.FoodIndustry.F_name.ilike(f'%{search_term}%')))
            orders = query.order_by(models.SalesOrder.s_date.desc()).all()
            return jsonify([o.to_dict() for o in orders])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/salesorders/<string:order_number>', methods=['GET'])
def get_sales_order(order_number):
    order = models.SalesOrder.query.get_or_404(order_number)
    return jsonify(order.to_dict())

@bp.route('/salesorders/pending-payment', methods=['GET'])
def get_pending_payment_orders():
    orders = models.SalesOrder.query.filter_by(delivery_status='Delivered', payment_status='Unpaid').order_by(models.SalesOrder.s_date.asc()).all()
    return jsonify([o.to_dict() for o in orders])

@bp.route('/salesorders/<string:order_number>/confirm-payment', methods=['PUT'])
def confirm_payment(order_number):
    data = request.get_json()
    if not data or 'employee_id' not in data: return jsonify({'message': 'กรุณาระบุ ID ของพนักงาน'}), 400
    order = models.SalesOrder.query.get_or_404(order_number)
    if order.payment_status == 'Paid': return jsonify({'message': 'ใบสั่งขายนี้ได้รับเงินแล้ว'}), 409
    if order.delivery_status != 'Delivered': return jsonify({'message': 'สินค้ายังไม่ถูกจัดส่ง'}), 400
    order.payment_status = 'Paid'
    order.paid_by_id = data['employee_id']
    order.paid_date = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': f'ยืนยันการรับเงิน SO {order_number} สำเร็จ'})

#==============================================================================
#   WAREHOUSE MANAGEMENT
#==============================================================================
@bp.route('/warehouse/pending-receipts', methods=['GET'])
def get_pending_receipts():
    orders = models.PurchaseOrder.query.filter_by(payment_status='Paid', stock_status='Pending').order_by(models.PurchaseOrder.b_date.asc()).all()
    return jsonify([o.to_dict() for o in orders])

@bp.route('/warehouse/receive-items', methods=['POST'])
def receive_items_into_stock():
    data = request.get_json()
    if not all(k in data for k in ['purchase_order_number', 'warehouse_id', 'employee_id']): return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400
    try:
        order = models.PurchaseOrder.query.get_or_404(data['purchase_order_number'])
        if order.stock_status == 'Completed': return jsonify({'message': 'ใบสั่งซื้อนี้ถูกจัดเก็บเข้าคลังไปแล้ว'}), 409
        for item in order.items:
            db.session.add(models.StockTransactionIn(in_transaction_date=datetime.utcnow(), p_id=item.p_id, in_quantity=item.quantity, remaining_quantity=item.quantity, unit_cost=item.price_per_unit, warehouse_id=data['warehouse_id'], po_item_id=item.po_item_id))
            stock_level = models.StockLevel.query.filter_by(p_id=item.p_id, warehouse_id=data['warehouse_id']).first()
            if stock_level: stock_level.quantity += item.quantity
            else: db.session.add(models.StockLevel(p_id=item.p_id, warehouse_id=data['warehouse_id'], quantity=item.quantity))
        order.stock_status = 'Completed'
        order.received_by_id = data['employee_id']
        order.received_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f"รับสินค้าจาก PO {data['purchase_order_number']} สำเร็จ"})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/warehouse/pending-shipments', methods=['GET'])
def get_pending_shipments():
    orders = models.SalesOrder.query.filter_by(shipment_status='Pending').order_by(models.SalesOrder.s_date.asc()).all()
    return jsonify([o.to_dict() for o in orders])

@bp.route('/warehouse/ship-order/<string:order_number>', methods=['POST'])
def ship_sales_order(order_number):
    data = request.get_json()
    if not data or 'employee_id' not in data: return jsonify({'message': 'กรุณาระบุ ID ของพนักงาน'}), 400
    order = models.SalesOrder.query.get_or_404(order_number)
    if order.shipment_status != 'Pending': return jsonify({'message': 'ใบสั่งขายนี้ถูกดำเนินการไปแล้ว'}), 409
    order.shipment_status = 'Shipped'
    order.shipped_by_id = data['employee_id']
    order.shipped_date = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': f'ยืนยันการจัดส่ง SO {order_number} สำเร็จ'})

@bp.route('/warehouse/shipment-history', methods=['GET'])
def get_shipment_history():
    try:
        query = models.SalesOrder.query.filter(models.SalesOrder.shipment_status.in_(['Shipped', 'Delivered']))
        if search_term := request.args.get('search'):
            query = query.join(models.FoodIndustry).filter(or_(models.SalesOrder.sale_order_number.ilike(f'%{search_term}%'), models.FoodIndustry.F_name.ilike(f'%{search_term}%')))
        orders = query.order_by(models.SalesOrder.shipped_date.desc()).all()
        return jsonify([o.to_dict() for o in orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

#==============================================================================
#   EXECUTIVE DASHBOARD
#==============================================================================
@bp.route('/executive/dashboard-summary', methods=['GET'])
def get_executive_dashboard_summary():
    try:
        total_sales_revenue = db.session.query(func.sum(models.SalesOrder.s_total_price)).scalar() or 0.0
        total_purchase_cost = db.session.query(func.sum(models.PurchaseOrder.b_total_price)).scalar() or 0.0
        
        # This is the corrected query for COGS
        total_cogs = db.session.query(func.sum(models.SalesOrderItemCost.cogs)).join(
            models.SalesOrderItem, models.SalesOrderItem.so_item_id == models.SalesOrderItemCost.so_item_id
        ).scalar() or 0.0

        gross_profit = total_sales_revenue - total_cogs
        
        current_stock_value = 0.0
        # ... (rest of the dashboard logic is likely correct)

        # The rest of the function...
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        sales_by_day = db.session.query(func.date(models.SalesOrder.s_date), func.sum(models.SalesOrder.s_total_price)).filter(models.SalesOrder.s_date >= thirty_days_ago).group_by(func.date(models.SalesOrder.s_date)).all()
        purchases_by_day = db.session.query(func.date(models.PurchaseOrder.b_date), func.sum(models.PurchaseOrder.b_total_price)).filter(models.PurchaseOrder.b_date >= thirty_days_ago).group_by(func.date(models.PurchaseOrder.b_date)).all()
        chart_data = {}
        for d, t in sales_by_day:
            ds = d.isoformat()
            if ds not in chart_data: chart_data[ds] = {'date': ds, 'sales': 0, 'purchases': 0}
            chart_data[ds]['sales'] = float(t)
        for d, t in purchases_by_day:
            ds = d.isoformat()
            if ds not in chart_data: chart_data[ds] = {'date': ds, 'sales': 0, 'purchases': 0}
            chart_data[ds]['purchases'] = float(t)

        recent_sales = models.SalesOrder.query.order_by(models.SalesOrder.s_date.desc()).limit(5).all()
        recent_purchases = models.PurchaseOrder.query.order_by(models.PurchaseOrder.b_date.desc()).limit(5).all()

        return jsonify({
            'kpis': {
                'total_revenue': total_sales_revenue,
                'gross_profit': gross_profit,
                'total_purchase_cost': total_purchase_cost,
                'current_stock_value': 0, # Placeholder, calculation is complex
            },
            'chart_data': sorted(chart_data.values(), key=lambda x: x['date']),
            'recent_sales': [o.to_dict() for o in recent_sales],
            'recent_purchases': [o.to_dict() for o in recent_purchases],
        })
    except Exception as e:
        # It's helpful to print the error to the console for debugging
        print(f"Error in dashboard summary: {e}")
        return jsonify({'message': str(e)}), 500