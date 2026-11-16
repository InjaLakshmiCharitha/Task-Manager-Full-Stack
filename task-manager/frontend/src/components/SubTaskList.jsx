import { useState } from "react";
import {
    createSubtask,
    updateSubtask,
    deleteSubtask,
} from "../api/subtasks";

const getErrorMessage = (data) => {
    if (!data) return "Something went wrong.";

    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
        return data.map(getErrorMessage).join(" ");
    }

    if (typeof data === "object") {
        return getErrorMessage(Object.values(data)[0]);
    }

    return "Something went wrong.";
};

const SubTaskList = ({ taskId, initialSubtasks = [] }) => {
    const [subtasks, setSubtasks] = useState(initialSubtasks);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const handleAdd = async (event) => {
        event.preventDefault();

        const trimmedTitle = title.trim();

        if (!trimmedTitle) {
            setError("Please enter a subtask title.");
            return;
        }

        setSaving(true);
        setError("");

        try {
            const response = await createSubtask({
                task: taskId,
                title: trimmedTitle,
            });

            setSubtasks((previous) => [
                ...previous,
                response.data,
            ]);

            setTitle("");
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data) ||
                "Unable to add subtask."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (subtask) => {
        if (updatingId !== null) return;

        setUpdatingId(subtask.id);
        setError("");

        const updatedValue = !subtask.is_completed;

        try {
            const response = await updateSubtask(subtask.id, {
                is_completed: updatedValue,
            });

            setSubtasks((previous) =>
                previous.map((item) =>
                    item.id === subtask.id
                        ? { ...item, ...response.data }
                        : item
                )
            );
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data) ||
                "Unable to update subtask."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (subtaskId) => {
        if (deletingId !== null) return;

        setDeletingId(subtaskId);
        setError("");

        try {
            await deleteSubtask(subtaskId);

            setSubtasks((previous) =>
                previous.filter((item) => item.id !== subtaskId)
            );
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data) ||
                "Unable to delete subtask."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const completedCount = subtasks.filter(
        (item) => item.is_completed
    ).length;

    return (
        <div className="subtask-list">
            <h4>
                Subtasks ({completedCount}/{subtasks.length} completed)
            </h4>

            {subtasks.length > 0 ? (
                subtasks.map((subtask) => (
                    <div className="subtask-item" key={subtask.id}>
                        <label>
                            <input
                                type="checkbox"
                                checked={Boolean(subtask.is_completed)}
                                onChange={() => handleToggle(subtask)}
                                disabled={updatingId === subtask.id}
                            />

                            <span
                                className={
                                    subtask.is_completed
                                        ? "subtask-completed"
                                        : ""
                                }
                            >
                                {subtask.title}
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={() => handleDelete(subtask.id)}
                            disabled={deletingId === subtask.id}
                        >
                            {deletingId === subtask.id
                                ? "Deleting..."
                                : "Delete"}
                        </button>
                    </div>
                ))
            ) : (
                <p>No subtasks added yet.</p>
            )}

            <form className="subtask-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter a subtask"
                    maxLength={255}
                    required
                />

                <button type="submit" disabled={saving}>
                    {saving ? "Adding..." : "Add"}
                </button>
            </form>

            {error && (
                <p className="error-message" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default SubTaskList;



