from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta

from tasks.models import Task


class Command(BaseCommand):
    help = "Send email reminders for tasks due tomorrow"

    def handle(self, *args, **options):
        tomorrow = timezone.localdate() + timedelta(days=1)

        tasks = Task.objects.filter(
            due_date__date=tomorrow
        ).exclude(
            status=Task.Status.DONE
        ).select_related("user")

        reminders_sent = 0

        for task in tasks:
            user = task.user

            if not user.email:
                continue

            subject = "Task Reminder - Due Tomorrow"

            message = (
                f"Hello {user.first_name or user.email},\n\n"
                f"This is a reminder that your task is due tomorrow.\n\n"
                f"Task: {task.title}\n"
                f"Description: {task.description or 'No description'}\n"
                f"Priority: {task.priority}\n\n"
                "Please complete your task on time.\n\n"
                "Thank you!"
            )

            send_mail(
                subject,
                message,
                None,
                [user.email],
                fail_silently=False,
            )

            reminders_sent += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully sent {reminders_sent} task reminders."
            )
        )
