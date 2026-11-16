import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.js";
import {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
} from "../api/auth.js";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadUser = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                if (isMounted) {
                    setLoading(false);
                }
                return;
            }

            try {
                const response = await getCurrentUser();

                if (isMounted) {
                    setUser(response.data);
                }
            } catch {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                if (isMounted) {
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            isMounted = false;
        };
    }, []);

    const register = async (userData) => {
        const response = await registerUser(userData);
        return response.data;
    };

    const login = async (email, password) => {
        const response = await loginUser({
            email,
            password,
        });

        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);

        try {
            const userResponse = await getCurrentUser();
            setUser(userResponse.data);
            return userResponse.data;
        } catch (error) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        const refreshToken = localStorage.getItem("refresh_token");

        try {
            if (refreshToken) {
                await logoutUser({
                    refresh: refreshToken,
                });
            }
        } finally {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            setUser(null);
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
                updateUser,
                isAuthenticated: Boolean(user),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};



