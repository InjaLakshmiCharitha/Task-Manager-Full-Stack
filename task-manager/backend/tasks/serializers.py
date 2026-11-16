import re
from django.utils import timezone
from rest_framework import serializers

from .models import Category, Task, SubTask


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "color", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        user = self.context["request"].user

        queryset = Category.objects.filter(
            user=user,
            name__iexact=value.strip()
        )

        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            raise serializers.ValidationError(
                "You already have a category with this name."
            )

        return value.strip()

    def validate_color(self, value):
        if not re.fullmatch(r"#[0-9A-Fa-f]{6}", value):
            raise serializers.ValidationError(
                "Enter a valid hex color, for example #4F46E5."
            )

        return value


class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ["id", "title", "is_completed", "created_at"]
        read_only_fields = ["id", "created_at"]


class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubTaskSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "category",
            "priority",
            "status",
            "due_date",
            "completed_at",
            "recurrence",
            "subtasks",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "completed_at",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "title": {
                "required": True,
                "min_length": 3,
                "max_length": 100,
            }
        }

    def validate_category(self, value):
        if value is not None:
            user = self.context["request"].user

            if value.user_id != user.id:
                raise serializers.ValidationError(
                    "You can only select your own categories."
                )

        return value

    def validate_due_date(self, value):
        if value is not None and value < timezone.now():
            raise serializers.ValidationError(
                "Due date cannot be in the past."
            )

        return value

    def create(self, validated_data):
        if validated_data.get("status") == Task.Status.DONE:
            validated_data["completed_at"] = timezone.now()

        return super().create(validated_data)

    def update(self, instance, validated_data):
        new_status = validated_data.get("status", instance.status)

        if new_status == Task.Status.DONE:
            if instance.status != Task.Status.DONE:
                instance.completed_at = timezone.now()
        else:
            instance.completed_at = None

        return super().update(instance, validated_data)

