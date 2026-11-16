from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone

from rest_framework.test import APITestCase

from .models import Category, Task, SubTask


User = get_user_model()


class TaskManagerAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email="taskuser@example.com",
            password="TestPassword123"
        )

        self.other_user = User.objects.create_user(
            email="otheruser@example.com",
            password="TestPassword123"
        )

        self.client.force_authenticate(user=self.user)

        self.category = Category.objects.create(
            user=self.user,
            name="Work",
            color="#6366F1"
        )

    def create_task(self, title="Complete project", **extra_fields):
        return Task.objects.create(
            user=self.user,
            title=title,
            **extra_fields
        )

    def test_authenticated_user_can_create_task(self):
        response = self.client.post(
            "/api/tasks/",
            {
                "title": "Complete assignment",
                "description": "Finish the project",
                "category": self.category.id,
                "priority": "High",
                "status": "To Do",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.filter(user=self.user).count(), 1)

    def test_user_can_view_only_own_tasks(self):
        own_task = self.create_task(title="My task")

        Task.objects.create(
            user=self.other_user,
            title="Other user's task"
        )

        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, 200)

        returned_tasks = response.data["results"]

        self.assertEqual(len(returned_tasks), 1)
        self.assertEqual(returned_tasks[0]["id"], own_task.id)

    def test_user_cannot_view_another_users_task(self):
        other_task = Task.objects.create(
            user=self.other_user,
            title="Private task"
        )

        response = self.client.get(
            f"/api/tasks/{other_task.id}/"
        )

        self.assertEqual(response.status_code, 404)

    def test_task_title_must_have_at_least_three_characters(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "AB"},
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_past_due_date_is_rejected(self):
        past_date = timezone.now() - timedelta(days=1)

        response = self.client.post(
            "/api/tasks/",
            {
                "title": "Past due task",
                "due_date": past_date.isoformat(),
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_task_can_be_marked_completed(self):
        task = self.create_task()

        response = self.client.patch(
            f"/api/tasks/{task.id}/toggle-complete/"
        )

        self.assertEqual(response.status_code, 200)

        task.refresh_from_db()

        self.assertEqual(task.status, Task.Status.DONE)
        self.assertIsNotNone(task.completed_at)

    def test_task_can_be_filtered_by_status(self):
        self.create_task(
            title="Pending task",
            status=Task.Status.TODO
        )

        completed_task = self.create_task(
            title="Completed task",
            status=Task.Status.DONE
        )

        response = self.client.get(
            "/api/tasks/",
            {"status": "Done"}
        )

        self.assertEqual(response.status_code, 200)

        returned_tasks = response.data["results"]

        self.assertEqual(len(returned_tasks), 1)
        self.assertEqual(returned_tasks[0]["id"], completed_task.id)

    def test_user_can_create_category(self):
        response = self.client.post(
            "/api/categories/",
            {
                "name": "Personal",
                "color": "#22AA88",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            Category.objects.filter(
                user=self.user,
                name="Personal"
            ).exists()
        )

    def test_category_names_must_be_unique_per_user(self):
        response = self.client.post(
            "/api/categories/",
            {
                "name": "work",
                "color": "#22AA88",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_user_cannot_assign_another_users_category(self):
        other_category = Category.objects.create(
            user=self.other_user,
            name="Private",
            color="#22AA88"
        )

        response = self.client.post(
            "/api/tasks/",
            {
                "title": "Test category ownership",
                "category": other_category.id,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)

    def test_category_deletion_removes_task_category(self):
        task = self.create_task(category=self.category)

        response = self.client.delete(
            f"/api/categories/{self.category.id}/"
        )

        self.assertEqual(response.status_code, 204)

        task.refresh_from_db()
        self.assertIsNone(task.category_id)

    def test_user_can_create_subtask(self):
        task = self.create_task()

        response = self.client.post(
            "/api/subtasks/",
            {
                "task": task.id,
                "title": "Prepare documentation",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(
            SubTask.objects.filter(
                task=task,
                title="Prepare documentation"
            ).exists()
        )

    def test_dashboard_returns_task_statistics(self):
        self.create_task(
            title="Pending task",
            status=Task.Status.TODO
        )

        self.create_task(
            title="Completed task",
            status=Task.Status.DONE
        )

        response = self.client.get("/api/tasks/dashboard/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_tasks"], 2)
        self.assertEqual(response.data["todo_tasks"], 1)
        self.assertEqual(response.data["done_tasks"], 1)

    def test_daily_recurring_task_creates_next_task(self):
        task = self.create_task(
            recurrence=Task.Recurrence.DAILY,
            due_date=timezone.now() + timedelta(days=1)
        )

        response = self.client.patch(
            f"/api/tasks/{task.id}/toggle-complete/"
        )

        self.assertEqual(response.status_code, 200)

        next_task = Task.objects.filter(
            parent_recurring_task=task
        ).first()

        self.assertIsNotNone(next_task)
        self.assertEqual(next_task.status, Task.Status.TODO)
        self.assertEqual(next_task.recurrence, Task.Recurrence.DAILY)
