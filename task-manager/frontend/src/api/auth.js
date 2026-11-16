import api from "./axios";

export const registerUser = (data) => {
    return api.post("auth/register/", data);
};

export const loginUser = (data) => {
    return api.post("auth/login/", data);
};

export const getCurrentUser = () => {
    return api.get("auth/me/");
};

export const updateProfile = (data) => {
    return api.patch("auth/me/", data);
};

export const changePassword = (data) => {
    return api.patch("auth/change-password/", data);
};

export const logoutUser = (data) => {
    return api.post("auth/logout/", data);
};
