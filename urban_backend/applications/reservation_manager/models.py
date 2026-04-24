from django.db import models
from table_manager.models import Table, Location

class Reservation(models.Model):
    STATUS_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Confirmado', 'Confirmado'),
        ('Completado', 'Completado'),
        ('Cancelado', 'Cancelado'),
    ]
    
    METHODS = [
        ('web', 'Sitio Web'),
        ('admin', 'Administrador'),
        ('phone', 'Teléfono'),
    ]

    name = models.CharField(max_length=200, verbose_name="Nombre del Cliente")
    identification = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    
    date = models.DateField()
    time = models.TimeField()
    persons = models.PositiveIntegerField()
    
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True)
    table = models.ForeignKey(Table, related_name='reservations', on_delete=models.SET_NULL, null=True, blank=True)
    
    instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pendiente')
    method = models.CharField(max_length=20, choices=METHODS, default='web')
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Reserva"
        verbose_name_plural = "Reservas"
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.name} - {self.date} {self.time} ({self.persons}p)"
