from app import db

class RoleAuthorization(db.Model):
    __tablename__ = 'role_authorization'
    role = db.Column(db.String(50), primary_key=True)
    program_id = db.Column(db.String(50), primary_key=True)
    program_name = db.Column(db.String(100))
    grant_permission = db.Column(db.String(50))