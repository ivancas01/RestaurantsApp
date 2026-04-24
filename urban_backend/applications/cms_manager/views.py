from rest_framework import serializers, viewsets, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import HeroSection, AboutSection, ContactSection, ReservationSection, BrandSection, SystemNotification

# Serializers for our explicit models
class HeroSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroSection
        exclude = ['id']

class AboutSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutSection
        exclude = ['id']

class ContactSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSection
        exclude = ['id']

class ReservationSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationSection
        exclude = ['id']

class BrandSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BrandSection
        exclude = ['id']

class SystemNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemNotification
        fields = '__all__'

# Mapping of section names to their respective models and serializers
SECTION_MAP = {
    'hero': (HeroSection, HeroSectionSerializer),
    'about': (AboutSection, AboutSectionSerializer),
    'contact': (ContactSection, ContactSectionSerializer),
    'reservations': (ReservationSection, ReservationSectionSerializer),
    'brand': (BrandSection, BrandSectionSerializer),
}

class CMSSectionViewSet(viewsets.ViewSet):
    """
    A custom ViewSet that acts as a proxy, routing requests like /cms/sections/<name>/
    to the appropriate explicit Singleton model, while maintaining the payload format
    { "name": "...", "content": {...} } expected by the frontend.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'name'

    def retrieve(self, request, name=None):
        if name not in SECTION_MAP:
            return Response({"error": "Sección no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        ModelClass, SerializerClass = SECTION_MAP[name]
        obj = ModelClass.load() # Get the singleton instance
        serializer = SerializerClass(obj)
        
        # Wrap in the expected frontend format
        return Response({
            "name": name,
            "content": serializer.data
        })

    def partial_update(self, request, name=None):
        if name not in SECTION_MAP:
            return Response({"error": "Sección no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        
        ModelClass, SerializerClass = SECTION_MAP[name]
        obj = ModelClass.load()
        
        # Frontend sends { "content": { "title": "...", ... } }
        # Sometimes they might send the raw data if they don't wrap it, let's handle both
        data = request.data.get('content', request.data)
        
        serializer = SerializerClass(obj, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "name": name,
                "content": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SystemNotificationViewSet(viewsets.ModelViewSet):
    queryset = SystemNotification.objects.filter(is_active=True)
    serializer_class = SystemNotificationSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
