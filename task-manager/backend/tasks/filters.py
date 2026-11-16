import django_filters
from django.utils import timezone

from .models import Task


class TaskFilter(django_filters.FilterSet):

    status = django_filters.ChoiceFilter(
        choices=Task.Status.choices
    )

    priority = django_filters.ChoiceFilter(
        choices=Task.Priority.choices
    )

    category = django_filters.NumberFilter(
        field_name="category_id"
    )

    due = django_filters.ChoiceFilter(
        method="filter_due",
        choices=[
            ("today", "Today"),
            ("overdue", "Overdue"),
            ("upcoming", "Upcoming"),
        ]
    )

    class Meta:
        model = Task
        fields = ["status", "priority", "category", "due"]

    def filter_due(self, queryset, name, value):
        now = timezone.now()
        today = timezone.localdate()

        if value == "today":
            return queryset.filter(
                due_date__date=today
            )

        if value == "overdue":
            return queryset.filter(
                due_date__lt=now
            ).exclude(
                status=Task.Status.DONE
            )

        if value == "upcoming":
            return queryset.filter(
                due_date__gt=now
            ).exclude(
                status=Task.Status.DONE
            )

        return queryset
