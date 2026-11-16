import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    getTasks,
    toggleTaskComplete,
    deleteTask,
} from "../api/tasks";
import { getCategories } from "../api/categories";
import TaskCard from "../components/TaskCard";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const PAGE_SIZE = 10;

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const category = searchParams.get("category") || "";
    const due = searchParams.get("due") || "";
    const ordering = searchParams.get("ordering") || "-created_at";

    const page = Math.max(
        1,
        Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const [searchInput, setSearchInput] = useState(search);
    const [totalCount, setTotalCount] = useState(0);

    const searchTimer = useRef(null);

    const loadTasks = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {
                page,
                page_size: PAGE_SIZE,
                ordering,
            };

            if (search) params.search = search;
            if (status) params.status = status;
            if (priority) params.priority = priority;
            if (category) params.category = category;
            if (due) params.due = due;

            const response = await getTasks(params);

            if (Array.isArray(response.data)) {
                setTasks(response.data);
                setTotalCount(response.data.length);
            } else {
                setTasks(response.data.results || []);
                setTotalCount(response.data.count || 0);
            }
        } catch {
            setError("Unable to load tasks.");
            setTasks([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, [page, search, status, priority, category, due, ordering]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();

                setCategories(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.results || []
                );
            } catch {
                console.error("Unable to load categories.");
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        return () => {
            clearTimeout(searchTimer.current);
        };
    }, []);

    const handleSearchChange = (value) => {
        setSearchInput(value);
        clearTimeout(searchTimer.current);

        searchTimer.current = setTimeout(() => {
            const updatedParams = new URLSearchParams(searchParams);

            if (value.trim()) {
                updatedParams.set("search", value.trim());
            } else {
                updatedParams.delete("search");
            }

            updatedParams.delete("page");
            setSearchParams(updatedParams);
        }, 500);
    };

    const updateFilter = (name, value) => {
        const updatedParams = new URLSearchParams(searchParams);

        if (value) {
            updatedParams.set(name, value);
        } else {
            updatedParams.delete(name);
        }

        updatedParams.delete("page");
        setSearchParams(updatedParams);
    };

    const handleToggle = async (taskId) => {
        try {
            await toggleTaskComplete(taskId);
            setToast("Task status updated successfully.");
            await loadTasks();
        } catch {
            setToast("Unable to update task.");
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
            return;
        }

        try {
            await deleteTask(taskId);

            setTasks((previousTasks) =>
                previousTasks.filter((task) => task.id !== taskId)
            );

            setTotalCount((previousCount) =>
                Math.max(0, previousCount - 1)
            );

            setToast("Task deleted successfully.");
        } catch {
            setToast("Unable to delete task.");
        }
    };

    const handleEdit = (taskId) => {
        navigate(`/tasks/${taskId}/edit`);
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const changePage = (newPage) => {
        const updatedParams = new URLSearchParams(searchParams);

        if (newPage > 1) {
            updatedParams.set("page", String(newPage));
        } else {
            updatedParams.delete("page");
        }

        setSearchParams(updatedParams);
    };

    return (
        <div className="tasks-container">
            <div className="tasks-header">
                <div>
                    <h1>My Tasks</h1>
                    <p>Organise and manage your daily tasks.</p>
                </div>

                <Link to="/tasks/new" className="add-task-button">
                    + Add Task
                </Link>
            </div>

            <Toast
                message={toast}
                type="success"
                onClose={() => setToast("")}
            />

            <div className="task-filters">
                <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchInput}
                    onChange={(event) =>
                        handleSearchChange(event.target.value)
                    }
                />

                <select
                    value={status}
                    onChange={(event) =>
                        updateFilter("status", event.target.value)
                    }
                >
                    <option value="">All Statuses</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                </select>

                <select
                    value={priority}
                    onChange={(event) =>
                        updateFilter("priority", event.target.value)
                    }
                >
                    <option value="">All Priorities</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>

                <select
                    value={category}
                    onChange={(event) =>
                        updateFilter("category", event.target.value)
                    }
                >
                    <option value="">All Categories</option>

                    {categories.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <select
                    value={due}
                    onChange={(event) =>
                        updateFilter("due", event.target.value)
                    }
                >
                    <option value="">All Due Dates</option>
                    <option value="today">Due Today</option>
                    <option value="overdue">Overdue</option>
                    <option value="upcoming">Upcoming</option>
                </select>

                <select
                    value={ordering}
                    onChange={(event) =>
                        updateFilter("ordering", event.target.value)
                    }
                >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="due_date">Due Date (Earliest)</option>
                    <option value="-due_date">Due Date (Latest)</option>
                    <option value="priority">Priority (Ascending)</option>
                    <option value="-priority">Priority (Descending)</option>
                </select>
            </div>

            {loading ? (
                <Loading />
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : tasks.length === 0 ? (
                <div className="empty-state">
                    <h2>No tasks found</h2>
                    <p>Create a task or change your filters.</p>
                </div>
            ) : (
                <>
                    <div className="tasks-grid">
                        {tasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                categories={categories}
                                onToggle={handleToggle}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>

                    <div className="pagination">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => changePage(page - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {page} of {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={page >= totalPages || totalPages === 0}
                            onClick={() => changePage(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default Tasks;



