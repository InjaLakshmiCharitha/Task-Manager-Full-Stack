from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Task, SubTask
from .serializers import (
    CategorySerializer,
    TaskSerializer,
    SubTaskSerializer,
)
from .filters import TaskFilter
from .recurrence import create_next_recurring_task


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(
            user=self.request.user
        ).order_by("name")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_class = TaskFilter
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "priority", "created_at"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Task.objects.filter(user=self.request.user)
            .select_related("category")
            .prefetch_related("subtasks")
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=["patch"], url_path="toggle-complete")
    def toggle_complete(self, request, pk=None):
        task = self.get_object()

        if task.status == Task.Status.DONE:
            new_status = Task.Status.TODO
        else:
            new_status = Task.Status.DONE

        serializer = self.get_serializer(
            task,
            data={"status": new_status},
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        if new_status == Task.Status.DONE:
            create_next_recurring_task(task)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        tasks = self.get_queryset()
        now = timezone.now()
        today = timezone.localdate()

        total_tasks = tasks.count()

        todo_tasks = tasks.filter(
            status=Task.Status.TODO
        ).count()

        in_progress_tasks = tasks.filter(
            status=Task.Status.IN_PROGRESS
        ).count()

        done_tasks = tasks.filter(
            status=Task.Status.DONE
        ).count()

        overdue_tasks = tasks.filter(
            due_date__lt=now
        ).exclude(status=Task.Status.DONE)

        due_today_tasks = tasks.filter(
            due_date__date=today
        )

        completion_percentage = (
            round((done_tasks / total_tasks) * 100, 2)
            if total_tasks > 0
            else 0
        )

        categories = Category.objects.filter(
            user=request.user
        ).order_by("name")

        tasks_per_category = [
            {
                "category_id": category.id,
                "category_name": category.name,
                "task_count": tasks.filter(
                    category=category
                ).count(),
            }
            for category in categories
        ]

        return Response({
            "total_tasks": total_tasks,
            "todo_tasks": todo_tasks,
            "in_progress_tasks": in_progress_tasks,
            "done_tasks": done_tasks,
            "overdue_tasks": overdue_tasks.count(),
            "due_today_tasks": due_today_tasks.count(),
            "completion_percentage": completion_percentage,
            "tasks_per_category": tasks_per_category,
        })


class SubTaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubTaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = SubTask.objects.filter(
            task__user=self.request.user
        ).select_related("task")

        task_id = self.request.query_params.get("task")

        if task_id:
            try:
                task_id = int(task_id)
            except (TypeError, ValueError):
                return queryset.none()

            queryset = queryset.filter(task_id=task_id)

        return queryset

    def perform_create(self, serializer):
        task_id = self.request.data.get("task")

        task = Task.objects.filter(
            id=task_id,
            user=self.request.user
        ).first()

        if not task:
            raise ValidationError({
                "task": "Task not found or you do not have permission."
            })

        serializer.save(task=task)






