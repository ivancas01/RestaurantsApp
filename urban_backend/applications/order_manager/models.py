from django.db import models
from django.conf import settings
from menu_manager.models import Product
from table_manager.models import Table
from reservation_manager.models import Reservation

class Order(models.Model):
    ORDER_TYPES = [
        ('table', 'Mesa'),
        ('delivery', 'Domicilio'),
    ]
    
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Confirmado', 'Confirmado'),
        ('En Lista', 'En Lista'),
        ('Preparando', 'Preparando'),
        ('Listo', 'Listo'),
        ('Completado', 'Completado'),
        ('Pagado', 'Pagado'),
        ('Cancelado', 'Cancelado'),
    ]

    type = models.CharField(max_length=20, choices=ORDER_TYPES, default='table')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pendiente')
    
    # Delivery Flags
    is_paid = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    # Customer Info
    customer_name = models.CharField(max_length=200, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)
    customer_id = models.CharField(max_length=50, blank=True, null=True, verbose_name="Identificación")
    customer_address = models.TextField(blank=True, null=True) # For delivery
    
    # Links
    table = models.ForeignKey(Table, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    waiter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    reservation = models.ForeignKey(Reservation, related_name='orders', on_delete=models.SET_NULL, null=True, blank=True)
    
    # Totals
    total = models.CharField(max_length=50, default="$0.00", verbose_name="Total")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    cancel_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ['-created_at']

    def __str__(self):
        return f"Pedido #{self.id} ({self.status})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField(default=1)
    price_at_order = models.CharField(max_length=50, verbose_name="Precio (Copia)") # Match Product price format
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.quantity}x {self.product.name} (Pedido #{self.order.id})"
