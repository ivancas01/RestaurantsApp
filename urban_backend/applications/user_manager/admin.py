from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ActivityLog

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Información Urban', {'fields': ('name', 'identification', 'phone')}),
    )
    list_display = ('username', 'name', 'identification', 'is_staff', 'is_active')

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'timestamp')
    list_filter = ('timestamp', 'user')
    readonly_fields = ('timestamp',)
