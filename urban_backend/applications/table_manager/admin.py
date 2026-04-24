from django.contrib import admin
from .models import Location, Table

class TableInline(admin.TabularInline):
    model = Table
    extra = 1
    exclude = ('shape',)

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name',)
    inlines = [TableInline]

@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ('number', 'location', 'capacity', 'status')
    list_filter = ('location', 'status')
    list_editable = ('status',)
