import os
import django
import sys

# Set up environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(BASE_DIR, 'applications'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from user_manager.models import User, Role

def assign_role():
    try:
        admin = User.objects.get(username='admin')
        super_role = Role.objects.get(slug='super_admin')
        admin.role = super_role
        admin.save()
        print(f"Role 'super_admin' assigned to user 'admin'.")
    except User.DoesNotExist:
        print("User 'admin' not found.")
    except Role.DoesNotExist:
        print("Role 'super_admin' not found.")

if __name__ == "__main__":
    assign_role()
