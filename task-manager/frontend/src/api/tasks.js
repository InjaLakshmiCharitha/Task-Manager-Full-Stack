import api from "./axios";

export const getTasks = (params = {}) => {
    return api.get("tasks/", { params });
};

export const getTask = (taskId) => {
    return api.get(`tasks/${taskId}/`);
};

export const createTask = (data) => {
    return api.post("tasks/", data);
};

export const updateTask = (taskId, data) => {
    return api.put(`tasks/${taskId}/`, data);
};

export const deleteTask = (taskId) => {
    return api.delete(`tasks/${taskId}/`);
};

export const toggleTaskComplete = (taskId) => {
    return api.patch(`tasks/${taskId}/toggle-complete/`);
};

export const getDashboardStats = () => {
    return api.get("tasks/dashboard/");
};
