from django.contrib import admin
from .models import HeroSection, AboutSection, ContactSection, ReservationSection, BrandSection, SystemNotification

class SingletonModelAdmin(admin.ModelAdmin):
    """
    Prevent deletion and adding new instances.
    """
    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(HeroSection)
class HeroSectionAdmin(SingletonModelAdmin):
    pass

@admin.register(AboutSection)
class AboutSectionAdmin(SingletonModelAdmin):
    pass

@admin.register(ContactSection)
class ContactSectionAdmin(SingletonModelAdmin):
    pass

@admin.register(ReservationSection)
class ReservationSectionAdmin(SingletonModelAdmin):
    pass

@admin.register(BrandSection)
class BrandSectionAdmin(SingletonModelAdmin):
    pass

@admin.register(SystemNotification)
class SystemNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'type', 'is_active', 'created_at')
    list_filter = ('type', 'is_active')
    list_editable = ('is_active',)
