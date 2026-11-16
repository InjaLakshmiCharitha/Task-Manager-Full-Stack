from django.contrib import admin
from .models import Category, Task, SubTask


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "user", "color", "created_at")
    search_fields = ("name", "user__email")
    list_filter = ("created_at",)


class SubTaskInline(admin.TabularInline):
    model = SubTask
    extra = 0


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "user",
        "priority",
        "status",
        "due_date",
        "created_at",
    )
    list_filter = ("status", "priority", "recurrence")
    search_fields = ("title", "description", "user__email")
    inlines = [SubTaskInline]


@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "task", "is_completed", "created_at")
    list_filter = ("is_completed",)
    search_fields = ("title", "task__title")
