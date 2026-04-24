from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, TableViewSet

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'tables', TableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
