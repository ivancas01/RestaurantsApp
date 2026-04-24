from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API Endpoints
    path('api/auth/', include('user_manager.urls')),
    path('api/menu/', include('menu_manager.urls')),
    path('api/venue/', include('table_manager.urls')),
    
    # Future apps (placeholders for now)
    path('api/orders/', include('order_manager.urls')),
    path('api/reservations/', include('reservation_manager.urls')),
    path('api/cms/', include('cms_manager.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
