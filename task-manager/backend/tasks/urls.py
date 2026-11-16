from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, TaskViewSet, SubTaskViewSet

router = DefaultRouter()

router.register("categories", CategoryViewSet, basename="category")
router.register("tasks", TaskViewSet, basename="task")
router.register("subtasks", SubTaskViewSet, basename="subtask")

urlpatterns = [
    path("", include(router.urls)),
]


