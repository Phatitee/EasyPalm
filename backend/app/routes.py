# backend/app/routes.py
from flask import request, jsonify, Blueprint
from . import models
from . import db
from sqlalchemy import func, asc, or_
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
import random
import requests
import os

bp = Blueprint('main', __name__)

#==============================================================================
# COMMON & UTILITY (API ที่ใช้ร่วมกัน)
#==============================================================================

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

    user_data = employee.to_dict()
    return jsonify({
        'message': 'Login สำเร็จ',
        'user': user_data
    })

@bp.route('/products', methods=['GET'])
def get_products():
    products = models.Product.query.all()
    return jsonify([p.to_dict() for p in products])

@bp.route('/farmers', methods=['GET'])
def get_farmers():
    farmers = models.Farmer.query.all()
    return jsonify([f.to_dict() for f in farmers])

@bp.route('/food-industries', methods=['GET'])
def get_food_industries():
    industries = models.FoodIndustry.query.all()
    return jsonify([i.to_dict() for i in industries])

@bp.route('/warehouses', methods=['GET'])
def get_warehouses():
    warehouses = models.Warehouse.query.all()
    return jsonify([w.to_dict() for w in warehouses])

@bp.route('/warehouse/storage-history', methods=['GET'])
def get_storage_history():
    try:
        search_term = request.args.get('search', '')
        warehouse_id_filter = request.args.get('warehouse_id', '')

        # --- 1. ดึงข้อมูล Purchase Orders ที่จัดเก็บสำเร็จ (Completed) ---
        po_query = models.PurchaseOrder.query.filter_by(stock_status='Completed')
        
        if search_term:
            # ค้นหาจากเลขที่ PO หรือชื่อเกษตรกร
            po_query = po_query.join(models.Farmer).filter(
                or_(
                    models.PurchaseOrder.purchase_order_number.ilike(f'%{search_term}%'),
                    models.Farmer.f_name.ilike(f'%{search_term}%')
                )
            )

        # (ส่วนนี้ยังไม่สมบูรณ์เพราะ PO ยังไม่มีข้อมูล warehouse_id โดยตรง)
        # if warehouse_id_filter:
        #     # ต้องหาวิธีเชื่อมโยง PO กับ Warehouse ที่รับของ
        #     pass

        completed_pos = po_query.all()
        po_list = []
        for po in completed_pos:
            po_list.append({
                'type': 'PO',
                'order_number': po.purchase_order_number,
                'source_name': po.farmer.f_name if po.farmer else 'N/A',
                'completed_date': po.received_date.isoformat() if po.received_date else None,
                'total_price': po.b_total_price,
                'responsible_person': po.received_by.e_name if po.received_by else 'N/A'
            })

        # --- 2. ดึงข้อมูล Sales Orders ที่รับคืนสำเร็จ (จัดเก็บคืนแล้ว) ---
        so_query = models.SalesOrder.query.filter_by(shipment_status='จัดเก็บคืนแล้ว')

        if search_term:
            # ค้นหาจากเลขที่ SO หรือชื่อลูกค้า
            so_query = so_query.join(models.FoodIndustry).filter(
                or_(
                    models.SalesOrder.sale_order_number.ilike(f'%{search_term}%'),
                    models.FoodIndustry.F_name.ilike(f'%{search_term}%')
                )
            )
        
        # (ส่วนนี้ต้องพัฒนาเพิ่ม) กรองตามคลังที่รับคืน
        # if warehouse_id_filter:
        #      # ต้อง join กับ StockTransactionReturn เพื่อหา warehouse_id
        #      pass

        returned_sos = so_query.all()
        so_return_list = []
        for so in returned_sos:
            so_return_list.append({
                'type': 'SO_Return',
                'order_number': so.sale_order_number,
                'source_name': so.customer.F_name if so.customer else 'N/A',
                'completed_date': so.delivered_date.isoformat() if so.delivered_date else None,
                'total_price': so.s_total_price,
                'responsible_person': so.delivered_by.e_name if so.delivered_by else 'N/A' # delivered_by คือคนที่กดยืนยันรับคืน
            })

        # --- 3. รวมและเรียงข้อมูล ---
        combined_list = po_list + so_return_list
        # เรียงตามวันที่ล่าสุดก่อน
        combined_list.sort(key=lambda x: x['completed_date'], reverse=True)

        return jsonify(combined_list)

    except Exception as e:
        print(f"Error in get_storage_history: {e}")
        return jsonify({'message': str(e)}), 500

#==============================================================================
# PRODUCT MANAGEMENT
#==============================================================================

@bp.route('/products', methods=['GET', 'POST'])
def handle_products():
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

    else:
        products = models.Product.query.all()
        return jsonify([p.to_dict() for p in products])

@bp.route('/products/<string:p_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_product(p_id):
    product = models.Product.query.get_or_404(p_id)

    if request.method == 'GET':
        return jsonify(product.to_dict())

    if request.method == 'PUT':
        data = request.get_json()
        product.p_name = data.get('p_name', product.p_name)
        product.price_per_unit = data.get('price_per_unit', product.price_per_unit)
        product.effective_date = datetime.utcnow()  # ตั้งเป็นเวลาปัจจุบันแบบ UTC
        db.session.commit()
        return jsonify(product.to_dict())

    if request.method == 'DELETE':
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': f'Product with id {p_id} has been deleted.'})


#==============================================================================
# EMPLOYEE MANAGEMENT
#==============================================================================

@bp.route('/employees', methods=['GET', 'POST'])
def handle_employees():
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

            try:
                role_enum = models.EmployeeRole(data['e_role'])
            except ValueError:
                return jsonify({'message': f"Role '{data['e_role']}' ไม่ถูกต้อง"}), 400

            new_employee = models.Employee(
                e_id=new_id,
                e_name=data['e_name'],
                username=data['username'],
                password=data['password'],
                e_role=role_enum,
                position=data['position'],
                e_citizen_id_card=data['e_citizen_id_card'],
                e_email=data.get('e_email'),
                e_tel=data.get('e_tel'),
                e_gender=data.get('e_gender', 'Male'),
                e_citizen_address=data.get('e_citizen_address', ''),
                e_address=data.get('e_address', ''),
                e_date_of_issue = datetime.utcnow()
            )
            db.session.add(new_employee)
            db.session.commit()
            return jsonify(new_employee.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            if 'UNIQUE constraint failed' in str(e):
                return jsonify({'message': 'Username หรือ เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว'}), 409
            return jsonify({'message': str(e)}), 500

    else:
        try:
            employees = models.Employee.query.all()
            return jsonify([e.to_dict() for e in employees])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/employees/<string:e_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_employee_by_id(e_id):
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
            employee.e_modified_date = datetime.utcnow()
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

@bp.route('/employees/<string:e_id>/suspend', methods=['PUT'])
def suspend_employee(e_id):
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
    employee = models.Employee.query.get_or_404(e_id)
    try:
        employee.is_active = True
        employee.suspension_date = None
        db.session.commit()
        return jsonify({'message': f'ยกเลิกการระงับสิทธิ์พนักงาน {e_id} เรียบร้อยแล้ว'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

#==============================================================================
# FARMER MANAGEMENT
#==============================================================================

@bp.route('/farmers', methods=['GET', 'POST'])
def handle_farmers():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('f_name') or not data.get('f_citizen_id_card') or not data.get('f_tel'):
            return jsonify({'message': 'ข้อมูลไม่ครบถ้วน (ต้องการ ชื่อ, เลขบัตรประชาชน, เบอร์โทร)'}), 400
        try:
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

    else:
        try:
            farmers = models.Farmer.query.all()
            return jsonify([f.to_dict() for f in farmers])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/farmers/<string:f_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_farmer(f_id):
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

#==============================================================================
# FOOD INDUSTRY (CUSTOMER) MANAGEMENT
#==============================================================================

@bp.route('/food-industries', methods=['GET', 'POST'])
def handle_food_industries():
    if request.method == 'POST':
        data = request.get_json()
        if not data or not data.get('F_name') or not data.get('F_tel'):
            return jsonify({'message': 'กรุณากรอกข้อมูล ชื่อและเบอร์โทร'}), 400
        try:
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

    else:
        try:
            industries = models.FoodIndustry.query.order_by(models.FoodIndustry.F_name).all()
            return jsonify([i.to_dict() for i in industries])
        except Exception as e:
            return jsonify({'message': str(e)}), 500

@bp.route('/food-industries/<string:f_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_food_industry(f_id):
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

#==============================================================================
# WAREHOUSE MANAGEMENT
#==============================================================================

@bp.route('/warehouses/<string:warehouse_id>', methods=['PUT', 'DELETE'])
def handle_warehouse(warehouse_id):
    warehouse = models.Warehouse.query.get_or_404(warehouse_id)

    if request.method == 'PUT':
        data = request.get_json()
        try:
            warehouse.warehouse_name = data.get('warehouse_name', warehouse.warehouse_name)
            warehouse.location = data.get('location', warehouse.location)
            if 'capacity' in data:
                warehouse.capacity = float(data['capacity'])
            db.session.commit()
            return jsonify(warehouse.to_dict())
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

    if request.method == 'DELETE':
        if models.StockLevel.query.filter_by(warehouse_id=warehouse_id).first():
            return jsonify({'message': 'ไม่สามารถลบคลังสินค้าได้เนื่องจากมีสต็อกสินค้าอยู่'}), 409
        try:
            db.session.delete(warehouse)
            db.session.commit()
            return jsonify({'message': f'คลังสินค้า {warehouse_id} ถูกลบเรียบร้อยแล้ว'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'message': str(e)}), 500

#==============================================================================
# PURCHASE & STOCK MANAGEMENT
#==============================================================================

@bp.route('/purchaseorders/<string:order_number>', methods=['GET'])
def get_purchase_order(order_number):
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
    else:
        try:
            query = models.PurchaseOrder.query
            warehouse_id = request.args.get('warehouse_id')
            if warehouse_id:
                query = query.join(models.PurchaseOrderItem).join(models.StockTransactionIn).filter(
                    models.StockTransactionIn.warehouse_id == warehouse_id
                )

            status_filter = request.args.get('status')
            if status_filter:
                status_lower = status_filter.lower()
                if status_lower == 'unpaid':
                    query = query.filter(models.PurchaseOrder.payment_status.in_(['Unpaid', None]))
                else:
                    status_capitalized = status_filter.capitalize()
                    if status_capitalized in ['Paid']:
                        query = query.filter(models.PurchaseOrder.payment_status == status_capitalized)
                    elif status_capitalized in ['Completed', 'Pending', 'Not Received']:
                        query = query.filter(models.PurchaseOrder.stock_status == status_capitalized)

            search_term = request.args.get('search')
            if search_term:
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
def get_stock_levels():
    try:
        query = db.session.query(
            models.StockLevel,
            models.Product.p_name,
            models.Warehouse.warehouse_name
        ).join(
            models.Product, models.StockLevel.p_id == models.Product.p_id
        ).join(
            models.Warehouse, models.StockLevel.warehouse_id == models.Warehouse.warehouse_id
        ).filter(models.StockLevel.quantity > 0)

        warehouse_id = request.args.get('warehouse_id')
        if warehouse_id:
            query = query.filter(models.StockLevel.warehouse_id == warehouse_id)

        search_term = request.args.get('search')
        if search_term:
            query = query.filter(models.Product.p_name.ilike(f'%{search_term}%'))

        stock_levels_data = query.order_by(models.Warehouse.warehouse_name, models.Product.p_name).all()

        results = []
        for sl, p_name, w_name in stock_levels_data:
            fifo_lots = models.StockTransactionIn.query.filter(
                models.StockTransactionIn.p_id == sl.p_id,
                models.StockTransactionIn.warehouse_id == sl.warehouse_id,
                models.StockTransactionIn.remaining_quantity > 0
            ).all()

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
# WAREHOUSE MANAGEMENT (สร้างใหม่สำหรับเจ้าหน้าที่คลังสินค้า)
#==============================================================================
@bp.route('/warehouse/confirm-return', methods=['POST'])
def confirm_return():
    data = request.get_json()
    order_number = data.get('sales_order_number')
    warehouse_id = data.get('warehouse_id')
    employee_id = data.get('employee_id') # employee_id ยังคงรับมา แต่อาจจะไม่ได้ใช้ใน StockTransactionReturn โดยตรง

    if not all([order_number, warehouse_id, employee_id]):
        return jsonify({'message': 'ข้อมูลไม่ครบถ้วน'}), 400

    try:
        order = models.SalesOrder.query.options(joinedload(models.SalesOrder.items)).get(order_number)
        
        if not order:
            return jsonify({'message': 'ไม่พบใบสั่งขายนี้'}), 404
        if order.shipment_status != 'รอจัดเก็บคืน':
            return jsonify({'message': f'สถานะปัจจุบันคือ "{order.shipment_status}" ไม่สามารถรับคืนได้'}), 409

        for item in order.items:
            stock = models.StockLevel.query.filter_by(
                p_id=item.p_id,
                warehouse_id=warehouse_id
            ).first()

            if not stock:
                stock = models.StockLevel(p_id=item.p_id, warehouse_id=warehouse_id, quantity=0)
                db.session.add(stock)
            
            stock.quantity += item.quantity

            # (★★★ จุดที่แก้ไข ★★★) เปลี่ยนไปใช้ models.StockTransactionReturn
            # และปรับแก้ฟิลด์ให้ตรงกับ Model
            transaction = models.StockTransactionReturn(
                return_transaction_date=datetime.utcnow(),
                return_quantity=item.quantity,
                p_id=item.p_id,
                warehouse_id=warehouse_id,
                so_item_id=item.so_item_id # ใช้ so_item_id จาก sales_order_item
                # สามารถเพิ่ม reason ได้ถ้าต้องการ เช่น reason=f'รับคืนจาก SO {order_number}'
            )
            db.session.add(transaction)

        order.shipment_status = 'จัดเก็บคืนแล้ว'
        
        db.session.commit()
        return jsonify({'message': f'รับคืนสินค้าจาก SO {order_number} สำเร็จ'})

    except Exception as e:
        db.session.rollback()
        print(f"Error in confirm_return: {e}")
        return jsonify({'message': str(e)}), 500

@bp.route('/warehouse/pending-receipts', methods=['GET'])
def get_pending_receipts():
    try:
        pending_orders = models.PurchaseOrder.query.filter_by(
            payment_status='Paid',
            stock_status='Pending'
        ).order_by(models.PurchaseOrder.b_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/warehouse/receive-items', methods=['POST'])
def receive_items_into_stock():
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

        order.stock_status = 'Completed'
        order.received_by_id = employee_id
        order.received_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f'รับสินค้าจาก PO {order_number} เข้าคลัง {warehouse_id} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/warehouse/stock-in-history', methods=['GET'])
def get_stock_in_history():
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

@bp.route('/warehouse/pending-shipments', methods=['GET'])
def get_pending_shipments():
    try:
        pending_orders = models.SalesOrder.query.filter_by(
            shipment_status='Pending'
        ).order_by(models.SalesOrder.s_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_orders])
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/warehouse/ship-order/<string:order_number>', methods=['POST'])
def ship_sales_order(order_number):
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

@bp.route('/purchasing/warehouse-summary', methods=['GET'])
def get_warehouse_summary():
    try:
        warehouses = models.Warehouse.query.all()
        summary = []
        for w in warehouses:
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
    try:
        query = models.SalesOrder.query.filter(
            models.SalesOrder.shipment_status.in_(['Shipped', 'Delivered'])
        )

        search_term = request.args.get('search')
        if search_term:
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

#==============================================================================
# SALES MANAGEMENT
#==============================================================================

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
            for item_data in data['items']:
                stock_level = models.StockLevel.query.filter_by(p_id=item_data['p_id'], warehouse_id=warehouse_id).first()
                if not stock_level or stock_level.quantity < float(item_data['quantity']):
                    product = models.Product.query.get(item_data['p_id'])
                    return jsonify({'message': f'สินค้า "{product.p_name}" ในคลัง "{warehouse_id}" มีไม่พอขาย!'}), 400

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

                if quantity_to_sell > 0:
                    raise Exception(f'เกิดข้อผิดพลาดในการคำนวณสต็อกสำหรับสินค้า {item.p_id}')

                stock_level_to_update = models.StockLevel.query.filter_by(p_id=item.p_id, warehouse_id=warehouse_id).first()
                stock_level_to_update.quantity -= item.quantity

            db.session.commit()
            return jsonify(new_order.to_dict()), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({'message': f"เกิดข้อผิดพลาด: {str(e)}"}), 500

    else:
        try:
            query = models.SalesOrder.query

            status_filter = request.args.get('status')
            if status_filter:
                query = query.filter(models.SalesOrder.payment_status == status_filter)

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
        
        
@bp.route('/salesorders/<string:order_number>/request-return', methods=['PUT'])
def request_return(order_number):
    data = request.get_json()
    if not data or not data.get('employee_id'):
        return jsonify({'message': 'กรุณาระบุ ID ของพนักงานที่ทำรายการ'}), 400
    
    employee_id = data.get('employee_id')
    
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        
        # ตรวจสอบว่าสถานะปัจจุบันคือ 'Shipped' (เบิกแล้ว) เท่านั้น ถึงจะขอคืนได้
        if order.shipment_status != 'Shipped':
            return jsonify({'message': f'ไม่สามารถขอคืนได้ สถานะปัจจุบันคือ "{order.shipment_status}"'}), 409

        # อัปเดตสถานะตาม Flow ที่คุยกัน
        order.delivery_status = 'ขอคืน'
        order.shipment_status = 'รอจัดเก็บคืน' # สถานะใหม่สำหรับ Warehouse
        
        # บันทึกว่าใครเป็นคนกดยืนยันขอคืน และเวลาใด
        order.delivered_by_id = employee_id 
        order.delivered_date = datetime.utcnow()

        db.session.commit()
        return jsonify({'message': f'ยืนยันการขอคืนสินค้า SO {order_number} สำเร็จ'})

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


@bp.route('/warehouse/pending-storage-items', methods=['GET'])
def get_pending_storage_items():
    try:
        # 1. ดึง PO ที่รอจัดเก็บ
        # (★★★ จุดที่แก้ไข ★★★) เปลี่ยนจาก status='Pending' เป็น receipt_status='Pending'
        pending_pos = models.PurchaseOrder.query.filter_by(stock_status='Pending').all()
        po_list = []
        for po in pending_pos:
            po_list.append({
                'type': 'PO',
                'order_number': po.purchase_order_number,
                'source_name': po.farmer.f_name if po.farmer else 'N/A',
                'order_date': po.created_date.isoformat() if po.created_date else None,
                'total_price': po.b_total_price
            })

        # 2. ดึง SO ที่ขอคืนและรอจัดเก็บ
        returned_sos = models.SalesOrder.query.filter_by(shipment_status='รอจัดเก็บคืน').all()
        so_return_list = []
        for so in returned_sos:
            so_return_list.append({
                'type': 'SO_Return',
                'order_number': so.sale_order_number,
                'source_name': so.customer.F_name if so.customer else 'N/A',
                'order_date': so.delivered_date.isoformat() if so.delivered_date else None,
                'total_price': so.s_total_price,
            })
        
        combined_list = po_list + so_return_list
        return jsonify(combined_list)

    except Exception as e:
        print(f"Error in get_pending_storage_items: {e}") 
        return jsonify({'message': str(e)}), 500
        
@bp.route('/salesorders/pending-delivery', methods=['GET'])
def get_pending_delivery_orders():
    """ API ใหม่: ดึงรายการ SO ที่เบิกของแล้ว แต่รอการยืนยันว่าถึงลูกค้า """
    try:
        pending_delivery_orders = models.SalesOrder.query.filter_by(
            shipment_status='Shipped'
        ).order_by(models.SalesOrder.shipped_date.asc()).all()
        return jsonify([order.to_dict() for order in pending_delivery_orders])
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

        order.shipment_status = 'Delivered'
        order.delivery_status = 'Delivered'
        order.delivered_by_id = employee_id
        order.delivered_date = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': f'ยืนยันการจัดส่ง SO {order_number} สำเร็จ'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500

@bp.route('/salesorders/<string:order_number>', methods=['GET'])
def get_sales_order(order_number):
    try:
        order = models.SalesOrder.query.get_or_404(order_number)
        return jsonify(order.to_dict())
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@bp.route('/salesorders/pending-payment', methods=['GET'])
def get_pending_payment_orders():
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

#==============================================================================
# ADMIN DASHBOARD
#==============================================================================

@bp.route('/admin/dashboard-summary', methods=['GET'])
def get_admin_dashboard_summary():
    try:
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

        purchase_today = db.session.query(func.sum(models.PurchaseOrder.b_total_price)).filter(
            models.PurchaseOrder.b_date >= today_start
        ).scalar() or 0

        pending_payments_count = models.PurchaseOrder.query.filter(
            models.PurchaseOrder.payment_status.in_(['Unpaid', None])
        ).count()

        employee_count = models.Employee.query.count()
        farmer_count = models.Farmer.query.count()

        recent_purchases = models.PurchaseOrder.query.order_by(models.PurchaseOrder.b_date.desc()).limit(5).all()

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

#==============================================================================
# REPORTS
#==============================================================================

@bp.route('/reports/profit-loss', methods=['GET'])
def get_profit_loss_report():
    start_date_str = request.args.get('start_date')
    end_date_str = request.args.get('end_date')

    if not start_date_str or not end_date_str:
        return jsonify({"error": "กรุณาระบุ start_date และ end_date (YYYY-MM-DD)"}), 400

    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
    except ValueError:
        return jsonify({"error": "รูปแบบวันที่ไม่ถูกต้อง กรุณาใช้ YYYY-MM-DD"}), 400

    total_revenue = db.session.query(func.sum(models.SalesOrder.s_total_price)).filter(
        models.SalesOrder.s_date.between(start_date, end_date)
    ).scalar() or 0.0

    total_cogs = db.session.query(func.sum(models.SalesOrderItemCost.cogs)).join(
        models.SalesOrderItem
    ).join(models.SalesOrder).filter(
        models.SalesOrder.s_date.between(start_date, end_date)
    ).scalar() or 0.0

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
        
        total_cogs = db.session.query(func.sum(models.SalesOrderItemCost.cogs)).join(
            models.SalesOrderItem, models.SalesOrderItem.so_item_id == models.SalesOrderItemCost.so_item_id
        ).scalar() or 0.0

        gross_profit = total_sales_revenue - total_cogs
        
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
        # ★★★ FIX: 'date' is already a string, so we don't need .isoformat() ★★★
        for date, total in sales_by_day:
            date_str = date #  <-- แก้ไขที่นี่
            if date_str not in chart_data: chart_data[date_str] = {'date': date_str, 'sales': 0, 'purchases': 0}
            chart_data[date_str]['sales'] = float(total)
        for date, total in purchases_by_day:
            date_str = date #  <-- และแก้ไขที่นี่
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
        print(f"!!! Critical Error in Executive Dashboard: {e}")
        return jsonify({'message': str(e)}), 500

@bp.route('/palm-price-history', methods=['GET'])
def get_palm_price_history():
    """
    Endpoint สำหรับดึงข้อมูลราคาน้ำมันปาล์มในตลาดโลกย้อนหลัง (ข้อมูลจริง)
    ใช้ FRED API และ ExchangeRate-API
    """
    try:
        # --- 1. ดึงข้อมูลราคาน้ำมันปาล์มจาก FRED ---
        # *** หมายเหตุ: ใส่ Key โดยตรงเพื่อการทดสอบเท่านั้น ***
        fred_api_key = "2fc981a925ee14522a58e5bd8bab8ded"
        fred_url = f"https://api.stlouisfed.org/fred/series/observations?series_id=PPOILUSDM&api_key={fred_api_key}&file_type=json&limit=60&sort_order=desc"
        
        fred_response = requests.get(fred_url)
        fred_response.raise_for_status()
        fred_data = fred_response.json()

        # --- 2. ดึงอัตราแลกเปลี่ยน USD to THB ---
        # *** หมายเหตุ: ใส่ Key โดยตรงเพื่อการทดสอบเท่านั้น ***
        exchange_rate_api_key = "79936a03491e31ccdefe6fe6"
        usd_to_thb_rate = 36.5  # ค่าเริ่มต้นเผื่อ API ล่ม
        
        try:
            exchange_url = f"https://v6.exchangerate-api.com/v6/{exchange_rate_api_key}/latest/USD"
            exchange_response = requests.get(exchange_url)
            exchange_response.raise_for_status()
            usd_to_thb_rate = exchange_response.json()['conversion_rates']['THB']
        except Exception as ex_err:
            print(f"Warning: Could not fetch exchange rate. Using default {usd_to_thb_rate}. Error: {ex_err}")


        # --- 3. ประมวลผลและจัดรูปแบบข้อมูล ---
        history_data = []
        for obs in fred_data.get('observations', []):
            # FRED อาจส่งค่า '.' มาสำหรับวันที่ไม่มีข้อมูล เราต้องกรองออก
            if obs['value'] == '.':
                continue
            
            price_usd_per_mt = float(obs['value'])
            
            # แปลงหน่วยจาก USD/Metric Ton -> THB/kg
            price_thb_per_kg = (price_usd_per_mt * usd_to_thb_rate) / 1000
            
            history_data.append({
                'date': obs['date'],
                'price': round(price_thb_per_kg, 2)
            })

        # เรียงข้อมูลจากเก่าสุดไปใหม่สุด
        history_data.reverse()

        return jsonify(history_data)

    except requests.exceptions.RequestException as req_err:
        print(f"API Request Error: {req_err}")
        return jsonify({'message': 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก API ภายนอก'}), 503
    except Exception as e:
        print(f"Error in get_palm_price_history: {e}")
        # กรณีเกิด Error ใดๆ ให้ส่งข้อมูลจำลองกลับไปแทน
        return jsonify(get_mock_palm_price_data()), 500

def get_mock_palm_price_data():
    """
    ฟังก์ชันสำรองสำหรับสร้างข้อมูลจำลองในกรณีที่ API จริงมีปัญหา
    """
    today = datetime.utcnow()
    history_data = []
    base_price = 35.0
    for i in range(30):
        date = today - timedelta(days=29 - i)
        price = base_price + random.uniform(-1.5, 1.5) + (i * 0.1)
        history_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'price': round(price, 2)
        })
    return history_data