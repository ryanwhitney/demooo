from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import User, Profile, Track

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'

class TrackInline(admin.TabularInline):
    model = Track
    extra = 0
    fields = ('title', 'created_at', 'audio_file_player')
    readonly_fields = ('created_at', 'audio_file_player')
    
    def audio_file_player(self, obj):
        if obj.audio_file:
            return format_html('<audio controls><source src="{}" type="audio/mpeg"></audio>', obj.audio_file.url)
        return "No audio file"
    audio_file_player.short_description = 'Audio Preview'

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined', 'track_count')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    readonly_fields = ('id', 'date_joined', 'last_login')
    inlines = (ProfileInline, TrackInline)
    
    fieldsets = (
        (None, {'fields': ('id', 'username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    def track_count(self, obj):
        count = obj.tracks.count()
        if count:
            url = reverse('admin:api_track_changelist') + f'?user__id__exact={obj.id}'
            return format_html('<a href="{}">{} tracks</a>', url, count)
        return '0 tracks'
    track_count.short_description = 'Tracks'

@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ('title', 'user_link', 'created_at', 'has_audio', 'audio_player')
    list_filter = ('created_at', 'user')
    search_fields = ('title', 'description', 'tags', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at', 'audio_player')
    
    fieldsets = (
        (None, {
            'fields': ('id', 'title', 'user', 'description', 'tags')
        }),
        ('Audio', {
            'fields': ('audio_file', 'audio_player'),
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
        }),
    )
    
    def user_link(self, obj):
        url = reverse('admin:api_user_change', args=[obj.user.id])
        return format_html('<a href="{}">{}</a>', url, obj.user.username)
    user_link.short_description = 'User'
    
    def has_audio(self, obj):
        return bool(obj.audio_file)
    has_audio.boolean = True
    has_audio.short_description = 'Has Audio'
    
    def audio_player(self, obj):
        if obj.audio_file:
            return format_html('<audio controls><source src="{}" type="audio/mpeg"></audio>', obj.audio_file.url)
        return "No audio file"
    audio_player.short_description = 'Audio Preview'
    
    def delete_model(self, request, obj):
        """Override to ensure file is deleted from storage"""
        if obj.audio_file:
            # Store the file path before deleting the model
            file_path = obj.audio_file.path
            # Delete the model first (which will handle cascade)
            super().delete_model(request, obj)
            # Then delete the file if it exists
            import os
            if os.path.exists(file_path):
                os.remove(file_path)
        else:
            super().delete_model(request, obj)
    
    def delete_queryset(self, request, queryset):
        """Override to ensure files are deleted when batch deleting"""
        # Get file paths before deleting objects
        file_paths = [obj.audio_file.path for obj in queryset if obj.audio_file]
        # Delete the queryset (which will handle cascade)
        super().delete_queryset(request, queryset)
        # Then delete the files
        import os
        for path in file_paths:
            if os.path.exists(path):
                os.remove(path)

# Note: Profile is not registered directly as it's accessed via User inline
# If you want to access it directly, you could uncomment this:
# @admin.register(Profile)
# class ProfileAdmin(admin.ModelAdmin):
#     list_display = ('user', 'bio', 'website', 'created_at', 'updated_at')
#     search_fields = ('user__username', 'bio', 'website')
#     readonly_fields = ('id', 'created_at', 'updated_at')