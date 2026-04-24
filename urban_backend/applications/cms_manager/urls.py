from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CMSSectionViewSet, SystemNotificationViewSet

router = DefaultRouter()
router.register(r'sections', CMSSectionViewSet, basename='cms-section')
router.register(r'notifications', SystemNotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
