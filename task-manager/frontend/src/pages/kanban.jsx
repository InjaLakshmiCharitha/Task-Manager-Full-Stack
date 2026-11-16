import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTasks, updateTask } from "../api/tasks";
import Loading from "../components/Loading";

const columns = ["To Do", "In Progress", "Done"];

const Kanban = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [draggedTask, setDraggedTask] = useState(null);

    const fetchTasks = useCallback(async () => {
        const response = await getTasks();
        return response.data.results || response.data;
    }, []);

    useEffect(() => {
        let isMounted = true;

        fetchTasks()
            .then((data) => {
                if (isMounted) {
                    setTasks(data);
                }
            })
            .catch(() => {
                if (isMounted) {
                    setError("Unable to load tasks.");
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [fetchTasks]);

    const handleDragStart = (event, task) => {
        setDraggedTask(task);
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", String(task.id));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    };

    const handleDrop = async (event, newStatus) => {
        event.preventDefault();

        const taskId = draggedTask?.id;
        const task = tasks.find((item) => item.id === taskId);

        if (!task || task.status === newStatus) {
            setDraggedTask(null);
            return;
        }

        const previousTasks = tasks;

        setTasks((currentTasks) =>
            currentTasks.map((item) =>
                item.id === taskId
                    ? { ...item, status: newStatus }
                    : item
            )
        );

        setDraggedTask(null);
        setError("");

        try {
            await updateTask(taskId, {
                ...task,
                status: newStatus,
            });
        } catch {
            setTasks(previousTasks);
            setError("Unable to move task. Please try again.");
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error && tasks.length === 0) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="kanban-container">
            <div className="kanban-header">
                <div>
                    <h1>Kanban Board</h1>
                    <p>Drag and drop tasks to update their status.</p>
                </div>

                <Link to="/tasks/new" className="add-task-button">
                    + Add Task
                </Link>
            </div>

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <div className="kanban-board">
                {columns.map((column) => {
                    const columnTasks = tasks.filter(
                        (task) => task.status === column
                    );

                    return (
                        <div
                            className="kanban-column"
                            key={column}
                            onDragOver={handleDragOver}
                            onDrop={(event) => handleDrop(event, column)}
                        >
                            <div className="kanban-column-header">
                                <h2>{column}</h2>
                                <span>{columnTasks.length}</span>
                            </div>

                            <div className="kanban-task-list">
                                {columnTasks.length === 0 ? (
                                    <p className="kanban-empty">
                                        Drop tasks here
                                    </p>
                                ) : (
                                    columnTasks.map((task) => (
                                        <div
                                            className="kanban-task"
                                            key={task.id}
                                            draggable
                                            onDragStart={(event) =>
                                                handleDragStart(event, task)
                                            }
                                            onDragEnd={() =>
                                                setDraggedTask(null)
                                            }
                                        >
                                            <h3>{task.title}</h3>

                                            <p>
                                                {task.description ||
                                                    "No description"}
                                            </p>

                                            <span
                                                className={`priority priority-${
                                                    task.priority === "High"
                                                        ? "red"
                                                        : task.priority === "Medium"
                                                            ? "orange"
                                                            : "green"
                                                }`}
                                            >
                                                {task.priority}
                                            </span>

                                            {task.due_date && (
                                                <small>
                                                    Due:{" "}
                                                    {new Date(
                                                        task.due_date
                                                    ).toLocaleDateString()}
                                                </small>
                                            )}

                                            <Link
                                                to={`/tasks/${task.id}/edit`}
                                            >
                                                Edit Task
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Kanban;

