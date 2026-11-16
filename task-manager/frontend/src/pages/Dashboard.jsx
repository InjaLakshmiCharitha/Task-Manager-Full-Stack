import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../api/tasks";
import Loading from "../components/Loading";

const Dashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;

        const fetchDashboard = async () => {
            try {
                const response = await getDashboardStats();

                if (isMounted) {
                    setDashboard(response.data);
                }
            } catch {
                if (isMounted) {
                    setError("Unable to load dashboard data.");
                }
            }
        };

        fetchDashboard();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!dashboard && !error) {
        return <Loading />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const statistics = [
        {
            title: "Total Tasks",
            value: dashboard.total_tasks ?? 0,
        },
        {
            title: "To Do",
            value: dashboard.todo_tasks ?? 0,
        },
        {
            title: "In Progress",
            value: dashboard.in_progress_tasks ?? 0,
        },
        {
            title: "Completed",
            value: dashboard.done_tasks ?? 0,
        },
        {
            title: "Overdue",
            value: dashboard.overdue_tasks ?? 0,
        },
        {
            title: "Due Today",
            value: dashboard.due_today_tasks ?? 0,
        },
    ];

    const completionPercentage = Math.min(
        100,
        Math.max(0, Number(dashboard.completion_percentage) || 0)
    );

    const categoryStatistics = dashboard.tasks_per_category || [];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome! Here's an overview of your tasks.</p>
                </div>

                <Link to="/tasks/new" className="add-task-button">
                    + Add New Task
                </Link>
            </div>

            <div className="statistics-grid">
                {statistics.map((item) => (
                    <div className="stat-card" key={item.title}>
                        <h3>{item.title}</h3>
                        <p>{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="completion-card">
                <h2>Overall Progress</h2>

                <div
                    className="progress-bar"
                    role="progressbar"
                    aria-valuenow={completionPercentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                >
                    <div
                        className="progress-fill"
                        style={{
                            width: `${completionPercentage}%`,
                        }}
                    ></div>
                </div>

                <p>{completionPercentage}% tasks completed</p>
            </div>

            <div className="category-statistics">
                <h2>Tasks by Category</h2>

                {categoryStatistics.length === 0 ? (
                    <p>
                        No categories available. Create your first category!
                    </p>
                ) : (
                    categoryStatistics.map((category) => (
                        <div
                            className="category-stat-card"
                            key={category.category_id}
                        >
                            <span>{category.category_name}</span>
                            <strong>{category.task_count} tasks</strong>
                        </div>
                    ))
                )}
            </div>

            <div className="dashboard-quick-links">
                <Link
                    to="/tasks?due=overdue"
                    className="view-tasks-link"
                >
                    View Overdue Tasks
                </Link>

                <Link
                    to="/tasks?due=today"
                    className="view-tasks-link"
                >
                    View Today's Tasks
                </Link>

                <Link to="/tasks" className="view-tasks-link">
                    View All Tasks
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;

