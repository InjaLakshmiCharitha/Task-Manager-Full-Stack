import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        const email = formData.email.trim();

        if (!email || !formData.password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            await login(email, formData.password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            const responseData = err.response?.data;

            setError(
                responseData?.detail ||
                responseData?.non_field_errors?.[0] ||
                "Invalid email or password. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>
                <p>Login to your Task Manager account</p>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <label htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                />

                <label htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>

                <p>
                    Don't have an account?{" "}
                    <Link to="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;

