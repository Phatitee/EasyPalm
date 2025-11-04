md
# EasyPalm

EasyPalm aims to be a comprehensive solution for managing various aspects of the palm oil industry, including employee management, farmer interactions, product handling, and order processing.

## Key Features & Benefits

*   **Employee Management:** Manage employee details, roles, and responsibilities within the system.
*   **Farmer Management:** Maintain a record of farmers, their contact information, and relevant details.
*   **Product Tracking:** Track products from creation to sale, including stock levels and transactions.
*   **Order Management:** Handle purchase and sales orders, including items and inventory.
*   **Warehouse Management:** Monitor stock levels and movements within warehouses.
*   **Role-based Access Control:** Different employee roles (Admin, Purchasing, etc.) determine access permissions.

## Prerequisites & Dependencies

Before setting up EasyPalm, ensure you have the following installed:

*   **Node.js:** JavaScript runtime environment for frontend development.
*   **Python:** Programming language for backend development.
*   **pip:** Package installer for Python.
*   **npm:** Package manager for Node.js.
*   **Flask:** Python web framework.
*   **Flask-SQLAlchemy:** SQLAlchemy integration for Flask.
*   **Flask-Migrate:** Alembic integration for Flask.
*   **Flask-CORS:** Cross-Origin Resource Sharing (CORS) handling for Flask.

## Installation & Setup Instructions

Follow these steps to install and set up EasyPalm:

1.  **Clone the Repository:**
    ```bash
    git clone <repository_url>
    cd EasyPalm
    ```

2.  **Backend Setup:**

    *   Navigate to the `backend` directory:
        ```bash
        cd backend
        ```

    *   Create a virtual environment:
        ```bash
        python -m venv venv
        ```

    *   Activate the virtual environment:

        *   **Windows:**
            ```bash
            .\venv\Scripts\activate
            ```

        *   **macOS/Linux:**
            ```bash
            source venv/bin/activate
            ```

    *   Install the required Python packages:
        ```bash
        pip install -r requirements.txt
        ```
        (Note: `requirements.txt` isn't explicitly provided but would generally contain `flask`, `flask-sqlalchemy`, `flask-migrate`, and `flask-cors`.)

    *   Seed the database (optional, for initial data):
        ```bash
        python seed.py
        ```

    *   Run the backend application:
        ```bash
        python run.py
        ```

3.  **Frontend Setup:**

    *   Navigate to the `frontend` directory:
        ```bash
        cd ../frontend  # Assuming you're in the backend directory
        ```

    *   Install Node.js dependencies:
        ```bash
        npm install
        ```

    *   Start the frontend application:
        ```bash
        npm start
        ```

## Usage Examples & API Documentation

API Documentation is not directly provided but would be expected to be served from the backend. Routes are established in `backend/app/routes.py` (not shown) that handle API requests.  Access the backend API endpoints by sending requests to the server address, for example: `http://127.0.0.1:5000/employees` (if such an endpoint exists). Consult the code for exact route definitions.

Frontend usage examples would involve interacting with the user interface to perform CRUD operations on data. Consult the frontend code for more specifics.

## Configuration Options

Backend configuration is primarily done within `backend/app/__init__.py`:

```python
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, '..', 'easypalm.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
```

*   **SQLALCHEMY_DATABASE_URI:**  Specifies the database connection string. In this example, it's using SQLite and stores the database file as `easypalm.db` in the parent directory of the `app` folder. This can be changed to other database systems such as PostgreSQL or MySQL.
*   **SQLALCHEMY_TRACK_MODIFICATIONS:** Controls whether SQLAlchemy tracks modifications to objects.  Setting it to `False` disables tracking, which can improve performance.

Environment variables can be used to configure different settings, such as database URLs or API keys.

## Project Structure

```
EasyPalm/
├── .gitignore
├── README.md
└── backend/
    ├── .gitignore
    └── app/
        ├── __init__.py
        ├── models/
        │   ├── __init__.py
        │   ├── employee.py
        │   ├── farmer.py
        │   ├── food_industry.py
        │   ├── product.py
        │   ├── purchase_order.py
        │   ├── purchase_order_item.py
        │   ├── sales_order.py
        │   ├── sales_order_item.py
        │   ├── stock_level.py
        │   ├── stock_transaction.py
        │   └── warehouse.py
        └── routes.py  # (Not provided but assumed to exist)
└── frontend/
    ├── ... (Frontend code, details not provided)

```



