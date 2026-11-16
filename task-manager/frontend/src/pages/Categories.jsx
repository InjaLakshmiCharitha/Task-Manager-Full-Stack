import { useEffect, useState, useCallback } from "react";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../api/categories";
import Loading from "../components/Loading";
import Toast from "../components/Toast";

const getErrorMessage = (data) => {
    if (!data) return "Unable to save category.";

    if (typeof data === "string") return data;

    if (Array.isArray(data)) {
        return data.map(getErrorMessage).join(" ");
    }

    if (typeof data === "object") {
        const firstValue = Object.values(data)[0];
        return getErrorMessage(firstValue);
    }

    return "Unable to save category.";
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#6366F1");
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");

    const fetchCategories = useCallback(async () => {
        const response = await getCategories();
        const data = response.data;

        return Array.isArray(data) ? data : data.results || [];
    }, []);

    useEffect(() => {
        let isMounted = true;

        const loadCategories = async () => {
            try {
                const data = await fetchCategories();

                if (isMounted) {
                    setCategories(data);
                }
            } catch {
                if (isMounted) {
                    setError(
                        "Unable to load categories. Please try again."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadCategories();

        return () => {
            isMounted = false;
        };
    }, [fetchCategories]);

    const resetForm = () => {
        setName("");
        setColor("#6366F1");
        setEditingId(null);
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const trimmedName = name.trim();

        if (!trimmedName) {
            setError("Category name cannot be empty.");
            return;
        }

        if (trimmedName.length > 50) {
            setError("Category name cannot exceed 50 characters.");
            return;
        }

        const categoryData = {
            name: trimmedName,
            color,
        };

        setSaving(true);

        try {
            if (editingId) {
                await updateCategory(editingId, categoryData);
                setToast("Category updated successfully.");
            } else {
                await createCategory(categoryData);
                setToast("Category created successfully.");
            }

            const updatedCategories = await fetchCategories();
            setCategories(updatedCategories);
            resetForm();
        } catch (err) {
            setError(getErrorMessage(err.response?.data));
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category.id);
        setName(category.name || "");
        setColor(category.color || "#6366F1");
        setError("");
    };

    const handleDelete = async (categoryId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this category?"
        );

        if (!confirmed) return;

        try {
            await deleteCategory(categoryId);

            const updatedCategories = await fetchCategories();
            setCategories(updatedCategories);

            setToast("Category deleted successfully.");

            if (editingId === categoryId) {
                resetForm();
            }
        } catch (err) {
            setToast(
                getErrorMessage(err.response?.data) ||
                "Unable to delete category."
            );
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="categories-container">
            <h1>Manage Categories</h1>
            <p>Create categories to organise your tasks.</p>

            <Toast
                message={toast}
                type="success"
                onClose={() => setToast("")}
            />

            <form className="category-form" onSubmit={handleSubmit}>
                <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <label htmlFor="category-name">Category Name</label>
                <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter category name"
                    maxLength={50}
                    required
                />

                <label htmlFor="category-color">Category Color</label>
                <input
                    id="category-color"
                    type="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                />

                <button type="submit" disabled={saving}>
                    {saving
                        ? "Saving..."
                        : editingId
                            ? "Update Category"
                            : "Create Category"}
                </button>

                {editingId && (
                    <button
                        type="button"
                        onClick={resetForm}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                )}
            </form>

            <div className="categories-list">
                <h2>Your Categories</h2>

                {categories.length === 0 ? (
                    <p>No categories created yet.</p>
                ) : (
                    categories.map((category) => (
                        <div className="category-card" key={category.id}>
                            <span
                                className="category-color"
                                style={{
                                    backgroundColor:
                                        category.color || "#6366F1",
                                }}
                            />

                            <strong>{category.name}</strong>

                            <div className="category-actions">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(category)}
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleDelete(category.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Categories;




