from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'time', 'persons', 'status', 'method')
    list_filter = ('status', 'method', 'date')
    search_fields = ('name', 'phone', 'email')
    list_editable = ('status',)
