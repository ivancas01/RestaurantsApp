from rest_framework import serializers
from .models import Location, Table

class TableSerializer(serializers.ModelSerializer):
    locationId = serializers.PrimaryKeyRelatedField(
        source='location',
        queryset=Location.objects.all()
    )
    
    class Meta:
        model = Table
        fields = ['id', 'number', 'capacity', 'status', 'shape', 'locationId']

class LocationSerializer(serializers.ModelSerializer):
    tables = TableSerializer(many=True, read_only=True)
    
    class Meta:
        model = Location
        fields = ['id', 'name', 'image', 'tables']
