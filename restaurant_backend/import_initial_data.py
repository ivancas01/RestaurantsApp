import os
import django
import decimal

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from menu_manager.models import Category, Product
from table_manager.models import Location, Table

def clean_price(price_str):
    return decimal.Decimal(price_str.replace('$', '').replace(',', ''))

def import_menu():
    # Since I cannot import JS directly into Python easily without a parser, 
    # I will replicate the data from the menu.js file I just read.
    
    data = [
        {
            'name': 'Entradas // Starters',
            'items': [
                {'name': "Tacos de Pulpo Grill", 'price': "18", 'desc': "Pulpo al carbón, emulsión de chipotle, piña asada y tortilla de maíz morado."},
                {'name': "Gyozas Urbanas", 'price': "14", 'desc': "Rellenas de cerdo y cebollino con salsa ponzu picante y sésamo negro."},
                {'name': "Carpaccio de Remolacha", 'price': "12", 'desc': "Láminas finas de remolacha asada, queso de cabra, nueces y vinagreta de miel."}
            ]
        },
        {
            'name': 'Platos Fuertes // Mains',
            'items': [
                {'name': "Burger 'The Architect'", 'price': "22", 'desc': "Wagyu A5, cheddar envejecido, cebolla caramelizada al bourbon y pan brioche artesanal."},
                {'name': "Street Style Ramen", 'price': "19", 'desc': "Caldo de 24 horas, chashu de cerdo ibérico, huevo ajitsuke y aceite de chili urbano."},
                {'name': "Salmón al Miso", 'price': "24", 'desc': "Glaseado con miso, puré de guisantes y espárragos trigueros al grill."}
            ]
        },
        {
            'name': 'Postres // Sweets',
            'items': [
                {'name': "Cheesecake de Matcha", 'price': "10", 'desc': "Base de galleta artesanal, crema de matcha y frutos rojos frescos."},
                {'name': "Mousse de Chocolate 70%", 'price': "9", 'desc': "Chocolate amargo, sal volcánica y aceite de oliva virgen extra."}
            ]
        },
        {
            'name': 'Bebidas // Drinks',
            'items': [
                {'name': "Gin Tonic Urbano", 'price': "12", 'desc': "Gin premium, tónica artesanal, pepino y cardamomo."},
                {'name': "Limonada de Carbón", 'price': "7", 'desc': "Limón siciliano, carbón activado y jarabe de agave."}
            ]
        }
    ]

    for cat_data in data:
        cat, _ = Category.objects.get_or_create(name=cat_data['name'])
        for item in cat_data['items']:
            Product.objects.get_or_create(
                category=cat,
                name=item['name'],
                defaults={
                    'price': decimal.Decimal(item['price']),
                    'description': item['desc']
                }
            )
    print("Menu imported successfully.")

def import_venue():
    locations = [
        {'name': 'Terranza Exterior', 'image': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop'},
        {'name': 'Salón Principal', 'image': 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800&auto=format&fit=crop'},
        {'name': 'Zona VIP', 'image': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop'}
    ]

    for loc_data in locations:
        loc, _ = Location.objects.get_or_create(name=loc_data['name'], defaults={'image': loc_data['image']})
        
        # Create some default tables for each location
        for i in range(1, 6):
            Table.objects.get_or_create(
                location=loc,
                number=str(i),
                defaults={'capacity': 4}
            )
    print("Venue data imported successfully.")

if __name__ == "__main__":
    import_menu()
    import_venue()
