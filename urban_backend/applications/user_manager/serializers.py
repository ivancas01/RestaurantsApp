from rest_framework import serializers
from django.contrib.auth.models import Group, Permission
from .models import User

class GroupSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    slug = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'slug', 'permissions']

    def get_permissions(self, obj):
        # Return a list of permission codenames
        return list(obj.permissions.values_list('codename', flat=True))

    def get_slug(self, obj):
        # Generate a slug from the name for frontend compatibility
        import re
        from django.utils.text import slugify
        if obj.name == 'Gerente':
            return 'super_admin'
        return slugify(obj.name).replace('-', '_')


class UserSerializer(serializers.ModelSerializer):
    groupId = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'identification', 'phone', 'is_active', 'is_staff', 'is_superuser', 'groupId', 'password']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Include groupId in the output
        group = instance.groups.first()
        ret['groupId'] = group.id if group else None
        return ret

    def create(self, validated_data):
        group_id = validated_data.pop('groupId', None)
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        
        if group_id:
            try:
                group = Group.objects.get(id=group_id)
                user.groups.add(group)
            except Group.DoesNotExist:
                pass
                
        return user

    def update(self, instance, validated_data):
        group_id = validated_data.pop('groupId', None)
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        if password:
            instance.set_password(password)
        instance.save()
        
        if group_id is not None:
            instance.groups.clear()
            try:
                group = Group.objects.get(id=group_id)
                instance.groups.add(group)
            except Group.DoesNotExist:
                pass
                
        return instance
