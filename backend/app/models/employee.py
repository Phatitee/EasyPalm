from app import db

class Employee(db.Model):
    __tablename__ = 'employee'
    e_id = db.Column(db.String(5), primary_key=True)
    e_name = db.Column(db.String(100), nullable=False)
    e_gender = db.Column(db.Enum('Male', 'Female'), nullable=False)
    e_citizen_id_card = db.Column(db.String(20), unique=True, nullable=False)
    e_tel = db.Column(db.String(10), nullable=False)
    e_citizen_address = db.Column(db.String(100), nullable=False)
    e_email = db.Column(db.String(50), nullable=False)
    e_address = db.Column(db.String(100), nullable=False)
    e_date_of_issue = db.Column(db.DateTime)
    e_expired_date = db.Column(db.DateTime)
    position = db.Column(db.String(100), nullable=False)
    e_role = db.Column(db.String(20), nullable=False)
    username = db.Column(db.String(20), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    e_modified_date = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'e_id': self.e_id,
            'e_name': self.e_name,
            'e_role': self.e_role,
            'position': self.position,
            'e_email': self.e_email,
            'e_tel': self.e_tel
        }