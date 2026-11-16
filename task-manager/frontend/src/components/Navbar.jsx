import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(
        () => localStorage.getItem("theme") === "dark"
    );

    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        document.body.classList.toggle("dark-mode", darkMode);
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);

        try {
            await logout();
        } catch {
            // Continue to login even if the logout API request fails.
        } finally {
            navigate("/login", { replace: true });
            setLoggingOut(false);
        }
    };

    return (
        <nav className="navbar">
            <Link to="/dashboard" className="navbar-brand">
                Task Manager
            </Link>

            <div className="navbar-links">
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/tasks">Tasks</NavLink>
                <NavLink to="/kanban">Kanban</NavLink>
                <NavLink to="/categories">Categories</NavLink>
                <NavLink to="/profile">Profile</NavLink>
            </div>

            <div className="navbar-user">
                <button
                    type="button"
                    className="theme-toggle"
                    onClick={() => setDarkMode((previous) => !previous)}
                    aria-label={
                        darkMode
                            ? "Switch to light mode"
                            : "Switch to dark mode"
                    }
                >
                    {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>

                <span>
                    {user?.first_name ||
                        user?.email ||
                        "User"}
                </span>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                >
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;


