import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_admin():
    username = 'admin'
    email = 'admin@urbanstreet.com'
    password = 'admin123'
    name = 'Admin Urban'
    
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            name=name,
            identification='00000000'
        )
        print(f"Superuser '{username}' created successfully.")
    else:
        print(f"Superuser '{username}' already exists.")

if __name__ == "__main__":
    create_admin()
