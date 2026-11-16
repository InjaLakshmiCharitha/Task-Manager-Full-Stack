from datetime import timedelta

from .models import Task


def create_next_recurring_task(task):
    if task.status != Task.Status.DONE:
        return None

    if task.recurrence == Task.Recurrence.NONE:
        return None

    # Prevent creating duplicate next occurrences
    if Task.objects.filter(parent_recurring_task=task).exists():
        return None

    if task.recurrence == Task.Recurrence.DAILY:
        next_due_date = (
            task.due_date + timedelta(days=1)
            if task.due_date
            else None
        )

    elif task.recurrence == Task.Recurrence.WEEKLY:
        next_due_date = (
            task.due_date + timedelta(weeks=1)
            if task.due_date
            else None
        )

    else:
        return None

    next_task = Task.objects.create(
        user=task.user,
        title=task.title,
        description=task.description,
        category=task.category,
        priority=task.priority,
        status=Task.Status.TODO,
        due_date=next_due_date,
        recurrence=task.recurrence,
        parent_recurring_task=task,
    )

    return next_task

