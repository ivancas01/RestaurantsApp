from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('price_at_order',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'type', 'status', 'is_paid', 'is_sent', 'table', 'customer_name', 'total', 'created_at')
    list_filter = ('status', 'type', 'created_at')
    search_fields = ('customer_name', 'customer_phone', 'id')
    inlines = [OrderItemInline]
    readonly_fields = ('total', 'created_at', 'updated_at')
