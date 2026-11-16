import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const getErrorMessage = (data) => {
    if (!data) {
        return "Registration failed. Please try again.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(getErrorMessage).join(" ");
    }

    if (typeof data === "object") {
        const firstValue = Object.values(data)[0];
        return getErrorMessage(firstValue);
    }

    return "Registration failed. Please try again.";
};

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: "",
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

        const registrationData = {
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            email: formData.email.trim(),
            password: formData.password,
            confirm_password: formData.confirm_password,
        };

        if (!registrationData.email) {
            setError("Email address is required.");
            return;
        }

        if (registrationData.password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        if (
            registrationData.password !==
            registrationData.confirm_password
        ) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            await register(registrationData);

            navigate("/login", {
                replace: true,
                state: {
                    message: "Registration successful. Please log in.",
                },
            });
        } catch (err) {
            setError(
                getErrorMessage(err.response?.data)
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Create Account</h2>
                <p>Register to start managing your tasks</p>

                {error && (
                    <div className="error-message" role="alert">
                        {error}
                    </div>
                )}

                <label htmlFor="register-first-name">
                    First Name
                </label>
                <input
                    id="register-first-name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    maxLength={150}
                />

                <label htmlFor="register-last-name">
                    Last Name
                </label>
                <input
                    id="register-last-name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    maxLength={150}
                />

                <label htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    autoComplete="email"
                    required
                />

                <label htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                />

                <label htmlFor="register-confirm-password">
                    Confirm Password
                </label>
                <input
                    id="register-confirm-password"
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    minLength={8}
                    autoComplete="new-password"
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>

                <p>
                    Already have an account?{" "}
                    <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;

