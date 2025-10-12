# backend/app/routes.py

from flask import request, jsonify, Blueprint
from . import models  # Import the 'models' object which contains all our model classes
from . import db      # Import the 'db' object for database sessions

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