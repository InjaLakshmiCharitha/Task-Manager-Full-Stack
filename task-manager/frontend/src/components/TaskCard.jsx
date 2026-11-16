import SubTaskList from "./SubTaskList";

const TaskCard = ({ task, categories = [], onToggle, onEdit, onDelete }) => {
    const priorityColors = {
        Low: "green",
        Medium: "orange",
        High: "red",
    };

    const categoryId =
        typeof task.category === "object"
            ? task.category?.id
            : task.category;

    const category =
        typeof task.category === "object"
            ? task.category
            : categories.find(
                (item) => String(item.id) === String(categoryId)
            );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = task.due_date
        ? new Date(`${task.due_date.split("T")[0]}T00:00:00`)
        : null;

    const isOverdue =
        dueDate &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < today &&
        task.status !== "Done";

    return (
        <div className={`task-card ${isOverdue ? "overdue-task" : ""}`}>
            <div className="task-card-header">
                <h3>{task.title}</h3>

                <span
                    className={`priority priority-${priorityColors[task.priority] || "green"}`}
                >
                    {task.priority}
                </span>
            </div>

            <p>{task.description || "No description available"}</p>

            <div className="task-card-details">
                <span>Status: {task.status}</span>

                {dueDate && (
                    <span className={isOverdue ? "overdue-date" : ""}>
                        Due: {dueDate.toLocaleDateString()}
                        {isOverdue && " (Overdue)"}
                    </span>
                )}
            </div>

            {category && (
                <div className="task-category">
                    <span
                        className="category-color"
                        style={{
                            backgroundColor: category.color || "#64748b",
                        }}
                    ></span>

                    <span>{category.name}</span>
                </div>
            )}

            <div className="task-card-actions">
                <button
                    type="button"
                    onClick={() => onToggle(task.id)}
                >
                    {task.status === "Done" ? "Undo" : "Complete"}
                </button>

                <button
                    type="button"
                    onClick={() => onEdit(task.id)}
                >
                    Edit
                </button>

                <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                >
                    Delete
                </button>
            </div>

            <SubTaskList
                taskId={task.id}
                initialSubtasks={task.subtasks || []}
            />
        </div>
    );
};

export default TaskCard;



