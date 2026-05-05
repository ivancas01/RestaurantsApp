from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre de Zona")
    image = models.ImageField(upload_to='locations/', blank=True, null=True, verbose_name="Imagen de Zona")

    class Meta:
        verbose_name = "Zona/Ubicación"
        verbose_name_plural = "Zonas/Ubicaciones"

    def __str__(self):
        return self.name

class Table(models.Model):
    SHAPE_CHOICES = [
        ('rect', 'Rectangular'),
        ('circle', 'Circular'),
    ]
    
    STATUS_CHOICES = [
        ('Disponible', 'Disponible'),
        ('Ocupada', 'Ocupada'),
        ('Reservada', 'Reservada'),
        ('Mantenimiento', 'Mantenimiento'),
    ]

    location = models.ForeignKey(Location, related_name='tables', on_delete=models.CASCADE)
    number = models.CharField(max_length=10, verbose_name="Número de Mesa")
    capacity = models.PositiveIntegerField(default=2, verbose_name="Capacidad")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Disponible')
    shape = models.CharField(max_length=10, choices=SHAPE_CHOICES, default='rect')

    class Meta:
        verbose_name = "Mesa"
        verbose_name_plural = "Mesas"
        unique_together = ['location', 'number']

    def __str__(self):
        return f"Mesa {self.number} ({self.location.name})"
