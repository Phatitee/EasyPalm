# backend/app/models/__init__.py

# This file imports all the model classes from their individual files
# into a single 'models' namespace. This makes it easier to access them
# from other parts of the application, like in the routes file.

# For example, instead of `from app.models.product import Product`,
# you can just do `from . import models` and then use `models.Product`.

from .employee import Employee
from .farmer import Farmer
from .product import Product
from .purchase_order import PurchaseOrder
from .sales_order import SalesOrder
from .stock_transaction import StockTransactionIn, StockTransactionOut, StockTransactionReturn
from .warehouse import Warehouse
from .role_authorization import RoleAuthorization
from .purchase_order_item import PurchaseOrderItem
from .stock_level import StockLevel
from .sales_order_item import SalesOrderItem