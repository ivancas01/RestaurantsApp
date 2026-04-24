from django.db import models

class SingletonModel(models.Model):
    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

class HeroSection(SingletonModel):
    title = models.CharField(max_length=200, default="URBAN GOURMET", verbose_name="Título Principal")
    subtitle = models.CharField(max_length=255, default="Experiencia Gastronómica", verbose_name="Subtítulo")
    established = models.CharField(max_length=100, default="EST. 2024", verbose_name="Texto Vertical (Año)")
    
    cta_menu = models.CharField(max_length=100, default="Ver Carta Completa", verbose_name="Texto Botón Carta")
    cta_reserva = models.CharField(max_length=100, default="Reservar Mesa", verbose_name="Texto Botón Reserva")
    
    # Fallback/Featured Item
    featured_image = models.TextField(blank=True, null=True, verbose_name="Imagen de Respaldo (URL o Base64)")
    featured_name = models.CharField(max_length=100, default="Truffle Burger", verbose_name="Nombre de Respaldo")
    featured_price = models.CharField(max_length=50, default="$24", verbose_name="Precio de Respaldo")
    featured_desc = models.CharField(max_length=255, default="Angus beef, truffle mayo, brioche.", verbose_name="Descripción de Respaldo")
    
    stats_label = models.CharField(max_length=100, default="Trending", verbose_name="Etiqueta Stats")
    stats_value = models.CharField(max_length=100, default="+124 Pedidos", verbose_name="Valor Stats")

    class Meta:
        verbose_name = "Sección Hero (Principal)"
        verbose_name_plural = "Sección Hero (Principal)"

    def __str__(self):
        return "Configuración Sección Hero"

class AboutSection(SingletonModel):
    title = models.CharField(max_length=200, default="Nosotros", verbose_name="Título Sección")
    years_value = models.CharField(max_length=50, default="15", verbose_name="Valor Insignia (Ej: Años)")
    years_label = models.CharField(max_length=100, default="Años de Excelencia", verbose_name="Texto Insignia")
    
    images = models.JSONField(default=list, blank=True, help_text="Lista de URLs o imágenes Base64", verbose_name="Galería de Fotos")
    content = models.TextField(default="Historia del restaurante...", verbose_name="Contenido de Historia")
    
    feature_1_title = models.CharField(max_length=100, default="Alta Cocina", verbose_name="Título Característica 1")
    feature_1_desc = models.CharField(max_length=255, default="Ingredientes premium", verbose_name="Desc. Característica 1")
    
    feature_2_title = models.CharField(max_length=100, default="Diseño Urbano", verbose_name="Título Característica 2")
    feature_2_desc = models.CharField(max_length=255, default="Atmósfera única", verbose_name="Desc. Característica 2")

    class Meta:
        verbose_name = "Sección Nosotros"
        verbose_name_plural = "Sección Nosotros"

    def __str__(self):
        return "Configuración Sección Nosotros"

class ContactSection(SingletonModel):
    address = models.CharField(max_length=255, default="Calle 123, Ciudad", verbose_name="Dirección Física")
    phone = models.CharField(max_length=100, default="+1 234 567 890", verbose_name="Teléfono de Contacto")
    email = models.EmailField(default="contacto@urbangourmet.com", verbose_name="Email Público")
    instagram = models.CharField(max_length=100, default="@urbangourmet", verbose_name="Instagram")
    whatsapp_prefix = models.CharField(max_length=10, default="57", verbose_name="Indicativo WhatsApp (Ej: 57)")

    class Meta:
        verbose_name = "Información de Contacto"
        verbose_name_plural = "Información de Contacto"

    def __str__(self):
        return "Configuración de Contacto"

class ReservationSection(SingletonModel):
    title = models.CharField(max_length=200, default="Reservaciones", verbose_name="Título de Reserva")
    subtitle = models.CharField(max_length=255, default="Asegura tu experiencia", verbose_name="Subtítulo / Slogan")
    help_text = models.CharField(max_length=255, default="Para reservas de más de 8 personas, contáctanos por teléfono.", verbose_name="Texto de Ayuda (Pax)")

    class Meta:
        verbose_name = "Sección de Reservas"
        verbose_name_plural = "Sección de Reservas"

    def __str__(self):
        return "Configuración Sección Reservas"

class BrandSection(SingletonModel):
    name = models.CharField(max_length=100, default="URBAN STREET", verbose_name="Nombre del Restaurante")
    tagline = models.CharField(max_length=200, default="Control Center", verbose_name="Eslogan / Tagline")

    class Meta:
        verbose_name = "Identidad de Marca"
        verbose_name_plural = "Identidad de Marca"

    def __str__(self):
        return "Configuración de Marca"

class SystemNotification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=50, default='info')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notificación del Sistema"
        verbose_name_plural = "Notificaciones del Sistema"

    def __str__(self):
        return self.title
