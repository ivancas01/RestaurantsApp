from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings

class User(AbstractUser):
    # Additional fields to match frontend PersonnelManager.jsx
    name = models.CharField(max_length=255, verbose_name="Nombre Completo")
    identification = models.CharField(max_length=50, unique=True, verbose_name="Identificación (ID)")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="Número de Celular")
    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        permissions = [
            ("dashboard_view", "Ver Dashboard"),
            ("reservations_manage", "Gestionar Reservas"),
            ("tables_manage", "Gestionar Mesas (Infraestructura)"),
            ("orders_manage", "Gestionar Pedidos"),
            ("products_manage", "Gestionar Menú y Productos"),
            ("kitchen_view", "Ver Display de Cocina"),
            ("cms_manage", "Gestionar Contenido CMS"),
            ("system_settings", "Gestionar Configuración y Personal"),
            ("delivery_manage", "Gestionar Domicilios"),
        ]

    def __str__(self):
        return f"{self.name} ({self.username})"


class ActivityLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255) # e.g., 'Nuevo pedido creado', 'Mesa 5 liberada'
    details = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Registro de Actividad"
        verbose_name_plural = "Registros de Actividad"
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.action} - {self.timestamp.strftime('%H:%M')}"
