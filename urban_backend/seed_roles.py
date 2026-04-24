import os
import django
import sys

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Add applications directory to sys.path
sys.path.insert(0, os.path.join(BASE_DIR, 'applications'))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from user_manager.models import Role

def seed_roles():
    roles = [
        {
            'name': 'Gerente',
            'slug': 'super_admin',
            'permissions': [
                'dashboard_view', 'reservations_manage', 'tables_manage', 
                'orders_manage', 'products_manage', 'kitchen_view', 
                'cms_manage', 'system_settings', 'delivery_manage'
            ]
        },
        {
            'name': 'Jefe de Cocina',
            'slug': 'chef',
            'permissions': ['kitchen_view', 'products_manage']
        },
        {
            'name': 'Mesero',
            'slug': 'waiter',
            'permissions': ['orders_manage', 'reservations_manage', 'delivery_manage']
        }
    ]

    for role_data in roles:
        role, created = Role.objects.update_or_create(
            slug=role_data['slug'],
            defaults={
                'name': role_data['name'],
                'permissions': role_data['permissions']
            }
        )
        if created:
            print(f"Role '{role.name}' created.")
        else:
            print(f"Role '{role.name}' updated.")

if __name__ == "__main__":
    seed_roles()
