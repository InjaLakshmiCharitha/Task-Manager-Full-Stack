import api from "./axios";

export const getCategories = () => {
    return api.get("categories/");
};

export const getCategory = (categoryId) => {
    return api.get(`categories/${categoryId}/`);
};

export const createCategory = (data) => {
    return api.post("categories/", data);
};

export const updateCategory = (categoryId, data) => {
    return api.put(`categories/${categoryId}/`, data);
};

export const deleteCategory = (categoryId) => {
    return api.delete(`categories/${categoryId}/`);
};
