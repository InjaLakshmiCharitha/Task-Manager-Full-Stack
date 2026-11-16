from django.conf import settings
from django.core.validators import MinLengthValidator
from django.db import models


class Category(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="categories"
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default="#6366F1")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_category_per_user"
            )
        ]

    def __str__(self):
        return self.name


class Task(models.Model):

    class Priority(models.TextChoices):
        LOW = "Low", "Low"
        MEDIUM = "Medium", "Medium"
        HIGH = "High", "High"

    class Status(models.TextChoices):
        TODO = "To Do", "To Do"
        IN_PROGRESS = "In Progress", "In Progress"
        DONE = "Done", "Done"

    class Recurrence(models.TextChoices):
        NONE = "None", "None"
        DAILY = "Daily", "Daily"
        WEEKLY = "Weekly", "Weekly"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks"
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks"
    )
    title = models.CharField(
        max_length=100,
        validators=[MinLengthValidator(3)]
    )
    description = models.TextField(blank=True)
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.TODO
    )
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    recurrence = models.CharField(
        max_length=10,
        choices=Recurrence.choices,
        default=Recurrence.NONE
    )
    parent_recurring_task = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recurring_occurrences"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["user", "due_date"]),
            models.Index(fields=["user", "priority"]),
        ]

    def __str__(self):
        return self.title


class SubTask(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="subtasks"
    )
    title = models.CharField(max_length=100)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return self.title
