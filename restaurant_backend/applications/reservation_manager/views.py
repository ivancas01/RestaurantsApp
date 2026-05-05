from rest_framework import serializers, viewsets, permissions
from .models import Reservation
from table_manager.models import Location, Table

class ReservationSerializer(serializers.ModelSerializer):
    location_name = serializers.ReadOnlyField(source='location.name')
    table_number = serializers.ReadOnlyField(source='table.number')
    locationId = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all(),
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = Reservation
        fields = '__all__'

class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    filterset_fields = ['status', 'date', 'location']

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
