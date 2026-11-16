import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    getTask,
    createTask,
    updateTask,
} from "../api/tasks";
import { getCategories } from "../api/categories";
import Loading from "../components/Loading";

const formatDateTimeLocal = (value) => {
    if (!value) return "";

    const date = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? `${value}T00:00:00`
            : value
    );

    if (Number.isNaN(date.getTime())) return "";

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60000);

    return localDate.toISOString().slice(0, 16);
};

const getErrorMessage = (data) => {
    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
        return data.map(getErrorMessage).join(" ");
    }

    if (data && typeof data === "object") {
        const messages = Object.values(data)
            .flatMap((value) => [getErrorMessage(value)])
            .filter(Boolean);

        return messages.join(" ");
    }

    return "";
};

const TaskForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        status: "To Do",
        due_date: "",
        recurrence: "None",
    });

    useEffect(() => {
        let isMounted = true;

        const loadFormData = async () => {
            setLoading(true);
            setError("");

            try {
                const categoryResponse = await getCategories();

                if (!isMounted) return;

                const categoryData = categoryResponse.data;

                setCategories(
                    Array.isArray(categoryData)
                        ? categoryData
                        : categoryData.results || []
                );

                if (isEditing) {
                    const taskResponse = await getTask(id);
                    const task = taskResponse.data;

                    if (!isMounted) return;

                    setFormData({
                        title: task.title || "",
                        description: task.description || "",
                        category:
                            typeof task.category === "object"
                                ? task.category?.id || ""
                                : task.category || "",
                        priority: task.priority || "Medium",
                        status: task.status || "To Do",
                        due_date: formatDateTimeLocal(task.due_date),
                        recurrence: task.recurrence || "None",
                    });
                }
            } catch {
                if (isMounted) {
                    setError(
                        "Unable to load task details. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadFormData();

        return () => {
            isMounted = false;
        };
    }, [id, isEditing]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const trimmedTitle = formData.title.trim();

        if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
            setError(
                "Task title must contain between 3 and 100 characters."
            );
            return;
        }

        setSaving(true);

        const taskData = {
            ...formData,
            title: trimmedTitle,
            description: formData.description.trim(),
            category: formData.category || null,
            due_date: formData.due_date
                ? new Date(formData.due_date).toISOString()
                : null,
        };

        try {
            if (isEditing) {
                await updateTask(id, taskData);
            } else {
                await createTask(taskData);
            }

            navigate("/tasks");
        } catch (err) {
            const message = getErrorMessage(err.response?.data);

            setError(
                message || "Unable to save task. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="task-form-container">
            <h1>{isEditing ? "Edit Task" : "Create New Task"}</h1>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <form className="task-form" onSubmit={handleSubmit}>
                <label htmlFor="title">Task Title</label>
                <input
                    id="title"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    minLength={3}
                    maxLength={100}
                    required
                />

                <label htmlFor="description">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                    rows={4}
                />

                <label htmlFor="category">Category</label>
                <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                >
                    <option value="">No Category</option>

                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>

                <label htmlFor="priority">Priority</label>
                <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                <label htmlFor="status">Status</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <label htmlFor="due_date">Due Date</label>
                <input
                    id="due_date"
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                />

                <label htmlFor="recurrence">Repeat Task</label>
                <select
                    id="recurrence"
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleChange}
                >
                    <option value="None">Does not repeat</option>
                    <option value="Daily">Every day</option>
                    <option value="Weekly">Every week</option>
                </select>

                <div className="form-actions">
                    <button type="submit" disabled={saving}>
                        {saving
                            ? "Saving..."
                            : isEditing
                                ? "Update Task"
                                : "Create Task"}
                    </button>

                    <Link to="/tasks">Cancel</Link>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;



