from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filterset_fields = ['status', 'type', 'table']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()
            return Response({'status': 'status updated'})
        return Response({'error': 'no status provided'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def kitchen_queue(self, request):
        # Specific view for the kitchen display
        queue = self.queryset.filter(status__in=['Pendiente', 'Preparando', 'Listo'])
        serializer = self.get_serializer(queue, many=True)
        return Response(serializer.data)
