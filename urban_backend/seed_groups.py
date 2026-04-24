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

from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from user_manager.models import User

def seed_groups():
    # Fetch content type for our User model where we defined the custom permissions
    user_content_type = ContentType.objects.get_for_model(User)

    groups_data = [
        {
            'name': 'Gerente',
            'permissions': [
                'dashboard_view', 'reservations_manage', 'tables_manage', 
                'orders_manage', 'products_manage', 'kitchen_view', 
                'cms_manage', 'system_settings', 'delivery_manage'
            ]
        },
        {
            'name': 'Jefe de cocina',
            'permissions': ['kitchen_view', 'products_manage']
        },
        {
            'name': 'Mesero',
            'permissions': ['orders_manage', 'reservations_manage', 'delivery_manage']
        }
    ]

    for group_data in groups_data:
        group, created = Group.objects.get_or_create(name=group_data['name'])
        
        # Clear existing permissions to ensure it strictly matches our definition
        group.permissions.clear()
        
        for codename in group_data['permissions']:
            try:
                # Find the permission
                permission = Permission.objects.get(
                    codename=codename,
                    content_type=user_content_type
                )
                group.permissions.add(permission)
            except Permission.DoesNotExist:
                print(f"Warning: Permission '{codename}' not found. Did you run migrations?")
        
        if created:
            print(f"Group '{group.name}' created with {len(group_data['permissions'])} permissions.")
        else:
            print(f"Group '{group.name}' updated with {len(group_data['permissions'])} permissions.")

if __name__ == "__main__":
    seed_groups()
