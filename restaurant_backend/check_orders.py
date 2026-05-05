import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from order_manager.models import Order

print("--- ORDERS IN DATABASE ---")
for order in Order.objects.all():
    print(f"ID: {order.id} | Type: {order.type} | Customer: {order.customer_name} | Address: {order.customer_address}")
