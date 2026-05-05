from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100, verbose_name="Nombre de Categoría")

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=200, verbose_name="Nombre del Producto")
    description = models.TextField(blank=True, verbose_name="Descripción")
    price = models.CharField(max_length=50, verbose_name="Precio") # Changed to CharField to accept "$24"
    image = models.ImageField(upload_to='products/', blank=True, null=True, verbose_name="Imagen")
    is_available = models.BooleanField(default=True, verbose_name="Disponible")

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"

    def __str__(self):
        return self.name
