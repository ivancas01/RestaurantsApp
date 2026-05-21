from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'type', 'table']
    
    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(waiter=self.request.user)
        else:
            serializer.save()

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        from django.utils import timezone
        from django.db.models import Sum
        from table_manager.models import Table
        from reservation_manager.models import Reservation
        
        today = timezone.now().date()
        
        # Today's Orders
        today_orders = Order.objects.filter(created_at__date=today)
        
        # Today's Sales (Manual parse because it's a CharField)
        paid_orders = today_orders.filter(models.Q(status='Pagado') | models.Q(is_paid=True))
        total_sales = 0.0
        for o in paid_orders:
            try:
                # Remove currency symbol and parse
                val = float(str(o.total).replace('$', '').replace(',', '').strip())
                total_sales += val
            except:
                pass
                
        # Active Orders
        active_orders_count = Order.objects.filter(
            status__in=['Pendiente', 'Confirmado', 'En Lista', 'Preparando', 'Listo']
        ).count()
        
        # Occupied Tables
        occupied_tables_count = Table.objects.filter(status='Ocupada').count()
        
        # Today's Reservations
        today_reservations_count = Reservation.objects.filter(date=today).count()
        
        return Response({
            'today_sales': total_sales,
            'active_orders': active_orders_count,
            'occupied_tables': occupied_tables_count,
            'today_reservations': today_reservations_count,
            'recent_orders': OrderSerializer(Order.objects.all()[:5], many=True).data,
            'recent_reservations': list(Reservation.objects.all().values()[:5])
        })

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            if new_status == 'Pagado':
                order.is_paid = True
            
            # Clear has_updates when the order is marked as ready or completed
            if new_status in ['Listo', 'Completado', 'Pagado', 'Servido', 'Entregado']:
                order.has_updates = False
                order.items.all().update(is_new=False)
                
            order.save()
            return Response({'status': 'status updated', 'is_paid': order.is_paid})
        return Response({'error': 'no status provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def customer_list(self, request):
        from django.db.models import Count, Max, Q
        from reservation_manager.models import Reservation
        
        # Get unique customer IDs from both models
        order_customers = Order.objects.exclude(customer_id__isnull=True).exclude(customer_id='').values_list('customer_id', flat=True).distinct()
        res_customers = Reservation.objects.exclude(identification__isnull=True).exclude(identification='').values_list('identification', flat=True).distinct()
        
        all_ids = set(list(order_customers) + list(res_customers))
        
        results = []
        for cid in all_ids:
            # Get latest info from either order or reservation
            last_order = Order.objects.filter(customer_id=cid).order_by('-created_at').first()
            last_res = Reservation.objects.filter(identification=cid).order_by('-created_at').first()
            
            name = ""
            last_visit = None
            total_activity = Order.objects.filter(customer_id=cid).count() + Reservation.objects.filter(identification=cid).count()
            
            if last_order and last_res:
                if last_order.created_at > last_res.created_at:
                    name = last_order.customer_name
                    last_visit = last_order.created_at
                else:
                    name = last_res.name
                    last_visit = last_res.created_at
            elif last_order:
                name = last_order.customer_name
                last_visit = last_order.created_at
            elif last_res:
                name = last_res.name
                last_visit = last_res.created_at
                
            results.append({
                'customer_id': cid,
                'name': name,
                'total_orders': total_activity,
                'last_visit': last_visit
            })

        results.sort(key=lambda x: x['last_visit'] if x['last_visit'] else '', reverse=True)
        return Response(results[:100]) # Limit to 100 for performance

    @action(detail=False, methods=['get'])
    def customer_stats(self, request):
        cid = request.query_params.get('identification')
        if not cid:
            return Response({'error': 'identification required'}, status=400)

        from reservation_manager.models import Reservation
        customer_orders = Order.objects.filter(customer_id=cid)
        customer_res = Reservation.objects.filter(identification=cid)
        
        if not customer_orders.exists() and not customer_res.exists():
            return Response({'error': 'customer not found'}, status=404)

        total_orders = customer_orders.count()
        total_res = customer_res.count()
        
        last_order = customer_orders.order_by('-created_at').first()
        last_res = customer_res.order_by('-created_at').first()
        
        # Get the very latest info
        main_ref = last_order if (last_order and (not last_res or last_order.created_at > last_res.created_at)) else last_res
        
        name = main_ref.customer_name if hasattr(main_ref, 'customer_name') else main_ref.name
        phone = main_ref.customer_phone if hasattr(main_ref, 'customer_phone') else main_ref.phone
        address = main_ref.customer_address if hasattr(main_ref, 'customer_address') else ''
        last_visit = main_ref.created_at

        # Most ordered product
        from .models import OrderItem
        from django.db.models import Count
        most_ordered = OrderItem.objects.filter(order__customer_id=cid).values('product__name').annotate(
            count=Count('id')
        ).order_by('-count').first()

        # Most used table (from orders)
        most_used_table = customer_orders.filter(type='table').values('table__number').annotate(
            count=Count('id')
        ).order_by('-count').first()

        # Recent history (last 5)
        recent_orders = list(customer_orders.order_by('-created_at')[:5].values('id', 'type', 'total', 'created_at', 'status'))
        recent_res = list(customer_res.order_by('-created_at')[:5].values('id', 'date', 'time', 'persons', 'status', 'created_at'))
        
        # Combine and sort
        combined_history = []
        for o in recent_orders:
            combined_history.append({
                'id': o['id'],
                'type': 'Pedido ' + ('(Mesa)' if o['type'] == 'table' else '(Domicilio)'),
                'detail': o['total'],
                'date': o['created_at'],
                'status': o['status']
            })
        for r in recent_res:
            combined_history.append({
                'id': r['id'],
                'type': 'Reserva',
                'detail': f"{r['persons']} personas",
                'date': f"{r['date']} {r['time']}",
                'status': r['status'],
                'created_at_sort': r['created_at']
            })
        
        # Sort combined history by date
        combined_history.sort(key=lambda x: x.get('created_at_sort') or x['date'], reverse=True)

        return Response({
            'identification': cid,
            'name': name,
            'phone': phone,
            'address': address,
            'total_orders': total_orders + total_res,
            'last_visit': last_visit,
            'most_ordered_product': most_ordered['product__name'] if most_ordered else 'N/A',
            'most_used_table': most_used_table['table__number'] if most_used_table else 'N/A',
            'recent_history': combined_history[:5]
        })

    @action(detail=False, methods=['get'])
    def search_customer(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response([])

        # Search in Orders
        orders = Order.objects.filter(
            models.Q(customer_id__icontains=query) | 
            models.Q(customer_name__icontains=query) |
            models.Q(customer_phone__icontains=query)
        ).values('customer_id', 'customer_name', 'customer_phone', 'customer_address').distinct()[:5]

        # Search in Reservations
        from reservation_manager.models import Reservation
        reservations = Reservation.objects.filter(
            models.Q(identification__icontains=query) | 
            models.Q(name__icontains=query) |
            models.Q(phone__icontains=query)
        ).values('identification', 'name', 'phone').distinct()[:5]

        # Combine and normalize
        results = {}
        for o in orders:
            cid = o['customer_id']
            if cid and cid not in results:
                results[cid] = {
                    'identification': cid,
                    'name': o['customer_name'],
                    'phone': o['customer_phone'],
                    'address': o['customer_address']
                }
        
        for r in reservations:
            rid = r['identification']
            if rid and rid not in results:
                results[rid] = {
                    'identification': rid,
                    'name': r['name'],
                    'phone': r['phone'],
                    'address': ''
                }

        return Response(list(results.values()))

    @action(detail=False, methods=['get'])
    def global_stats(self, request):
        from django.db.models import Sum, Count, F
        from django.utils import timezone
        from datetime import timedelta
        
        # Last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        # Check both is_paid flag and status='Pagado'
        recent_orders = Order.objects.filter(
            created_at__range=(start_date, end_date)
        ).filter(models.Q(is_paid=True) | models.Q(status='Pagado'))
        
        # Total Sales (Parsing string total "$X.XX")
        # Since total is a string, we might need to parse it in Python or use a database-specific function
        # For simplicity and reliability with current schema:
        total_revenue = 0
        for o in recent_orders:
            try:
                val = float(str(o.total).replace('$', '').replace(',', '').strip())
                total_revenue += val
            except:
                pass

        # Top Products
        from .models import OrderItem
        top_products = OrderItem.objects.filter(order__in=recent_orders).values('product__name').annotate(
            total_qty=Sum('quantity'),
            total_sales=Count('id')
        ).order_by('-total_qty')[:5]

        # Sales by Day
        sales_by_day = []
        for i in range(30):
            day = end_date - timedelta(days=i)
            day_orders = recent_orders.filter(created_at__date=day.date())
            day_rev = 0
            for do in day_orders:
                try:
                    day_rev += float(str(do.total).replace('$', '').replace(',', '').strip())
                except:
                    pass
            sales_by_day.append({
                'date': day.date().strftime('%Y-%m-%d'),
                'revenue': day_rev,
                'count': day_orders.count()
            })
        
        sales_by_day.reverse()

        return Response({
            'total_revenue_30d': total_revenue,
            'total_orders_30d': recent_orders.count(),
            'top_products': list(top_products),
            'sales_by_day': sales_by_day
        })

    @action(detail=False, methods=['get'])
    def cash_closing(self, request):
        from django.utils import timezone
        # Use local time for Bogota
        today = timezone.localtime(timezone.now()).date()
        
        # Allow passing a specific date
        date_param = request.query_params.get('date')
        if date_param:
            try:
                from datetime import datetime
                today = datetime.strptime(date_param, '%Y-%m-%d').date()
            except:
                pass

        orders_today = Order.objects.filter(
            created_at__date=today
        ).filter(models.Q(is_paid=True) | models.Q(status='Pagado'))
        
        totals_by_method = {
            'Cash': 0,
            'Card': 0,
            'Transfer': 0,
            'Unknown': 0
        }
        
        total_day = 0
        for o in orders_today:
            try:
                val = float(str(o.total).replace('$', '').replace(',', '').strip())
                total_day += val
                method = o.payment_method or 'Unknown'
                if method in totals_by_method:
                    totals_by_method[method] += val
                else:
                    totals_by_method['Unknown'] += val
            except:
                pass

        return Response({
            'date': today.strftime('%Y-%m-%d'),
            'total_day': total_day,
            'count_day': orders_today.count(),
            'by_method': totals_by_method,
            'orders': OrderSerializer(orders_today, many=True).data
        })

    @action(detail=False, methods=['get'])
    def kitchen_queue(self, request):
        # Specific view for the kitchen display
        queue = self.queryset.filter(status__in=['Pendiente', 'Preparando', 'Listo'])
        serializer = self.get_serializer(queue, many=True)
        return Response(serializer.data)
