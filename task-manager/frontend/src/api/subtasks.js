import api from "./axios";

export const getSubtasks = (taskId) => {
    return api.get("subtasks/", {
        params: { task: taskId },
    });
};

export const createSubtask = (data) => {
    return api.post("subtasks/", data);
};

export const updateSubtask = (subtaskId, data) => {
    return api.patch(`subtasks/${subtaskId}/`, data);
};

export const deleteSubtask = (subtaskId) => {
    return api.delete(`subtasks/${subtaskId}/`);
};
