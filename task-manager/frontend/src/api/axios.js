import axios from "axios";

const API_URL = (
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api/"
).replace(/\/?$/, "/");

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!originalRequest || error.response?.status !== 401) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || "";

        const isAuthRequest =
            requestUrl.includes("auth/login/") ||
            requestUrl.includes("auth/register/") ||
            requestUrl.includes("auth/token/refresh/");

        if (isAuthRequest || originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        const refreshToken = localStorage.getItem("refresh_token");

        if (!refreshToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

            return Promise.reject(error);
        }

        try {
            const response = await axios.post(
                `${API_URL}auth/token/refresh/`,
                {
                    refresh: refreshToken,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const newAccessToken = response.data.access;

            localStorage.setItem("access_token", newAccessToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

            return Promise.reject(refreshError);
        }
    }
);

export default api;



