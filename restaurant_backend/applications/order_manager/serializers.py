from rest_framework import serializers
from .models import Order, OrderItem
from menu_manager.models import Product
from reservation_manager.models import Reservation

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_order', 'notes', 'is_new']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    table_number = serializers.ReadOnlyField(source='table.number')
    identification = serializers.CharField(source='customer_id', required=False, allow_blank=True, allow_null=True)
    reservationId = serializers.PrimaryKeyRelatedField(
        source='reservation',
        queryset=Reservation.objects.all(),
        required=False, allow_null=True
    )
    isPaid = serializers.BooleanField(source='is_paid', required=False)
    isSent = serializers.BooleanField(source='is_sent', required=False)
    waiter_name = serializers.ReadOnlyField(source='waiter.username')
    
    class Meta:
        model = Order
        fields = [
            'id', 'type', 'status', 'isPaid', 'isSent', 'payment_method', 'customer_name', 'customer_phone', 'identification',
            'customer_address', 'table', 'table_number', 'waiter', 'waiter_name', 'reservationId',
            'total', 'created_at', 'updated_at', 'cancel_reason', 'notes', 'items', 'has_updates'
        ]
        read_only_fields = ['total', 'created_at', 'updated_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        
        total_val = 0.0
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            # Parse string price "$24.00" -> 24.00
            price_str = str(item_data['price_at_order']).replace('$', '').replace(',', '').strip()
            price_val = float(price_str) if price_str else 0.0
            total_val += price_val * item_data['quantity']
        
        order.total = f"${total_val:.2f}"
        
        # Automatically complete linked reservation
        if order.reservation:
            order.reservation.status = 'Completada'
            order.reservation.save()
            
        order.save()
        return order

    def update(self, instance, validated_data):
        if instance.status == 'Pagado':
            raise serializers.ValidationError("No se puede editar un pedido que ya ha sido pagado.")
            
        items_data = validated_data.pop('items', None)
        
        # Update instance fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            # Simple approach: clear and recreate items
            instance.items.all().delete()
            total_val = 0.0
            for item_data in items_data:
                OrderItem.objects.create(order=instance, **item_data)
                # Parse string price "$24.00" -> 24.00
                price_str = str(item_data['price_at_order']).replace('$', '').replace(',', '').strip()
                price_val = float(price_str) if price_str else 0.0
                total_val += price_val * item_data['quantity']
            
            instance.total = f"${total_val:.2f}"
        
        # Automatically complete linked reservation
        if instance.reservation:
            instance.reservation.status = 'Completada'
            instance.reservation.save()

        instance.save()
            
        return instance
