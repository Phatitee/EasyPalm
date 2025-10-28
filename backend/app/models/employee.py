from app import db
import enum
from datetime import datetime

# --- Enum สำหรับ Role ทั้งหมด ---
class EmployeeRole(enum.Enum):
    ADMIN = 'admin'
    PURCHASING = 'purchasing'
    WAREHOUSE = 'warehouse'
    SALES = 'sales'
    ACCOUNTANT = 'accountant'
    EXECUTIVE = 'executive'

class Employee(db.Model):
    __tablename__ = 'employee'
    e_id = db.Column(db.String(5), primary_key=True)
    e_name = db.Column(db.String(100), nullable=False)
    e_gender = db.Column(db.Enum('Male', 'Female'), nullable=True) # Allow null for flexibility
    e_citizen_id_card = db.Column(db.String(20), unique=True, nullable=False)
    e_tel = db.Column(db.String(10), nullable=True)
    e_citizen_address = db.Column(db.String(100), nullable=True)
    e_email = db.Column(db.String(50), nullable=True)
    e_address = db.Column(db.String(100), nullable=True)
    e_date_of_issue = db.Column(db.DateTime)
    e_expired_date = db.Column(db.DateTime)
    position = db.Column(db.String(100), nullable=False)

    e_role = db.Column(db.Enum(EmployeeRole, values_callable=lambda obj: [e.value for e in obj], native_enum=False), nullable=False)

    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    e_modified_date = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    suspension_date = db.Column(db.DateTime, nullable=True)


    def to_dict(self):
        # ฟังก์ชันนี้จะแปลงค่า Enum เป็น string 'admin' โดยอัตโนมัติ
        return {
            'e_id': self.e_id,
            'e_name': self.e_name,
            'e_role': self.e_role.value if self.e_role else None,
            'position': self.position,
            'e_email': self.e_email,
            'e_tel': self.e_tel,
            'e_gender': self.e_gender,
            'e_citizen_id_card': self.e_citizen_id_card,
            'e_address': self.e_address,
            'username': self.username,
            'is_active': self.is_active,
            'suspension_date': self.suspension_date.isoformat() if self.suspension_date else None,
        }