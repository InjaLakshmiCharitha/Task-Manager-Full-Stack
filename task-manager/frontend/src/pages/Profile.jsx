import { useState } from "react";
import { updateProfile, changePassword } from "../api/auth";
import { useAuth } from "../context/useAuth";
import Toast from "../components/Toast";

const getErrorMessage = (data) => {
    if (!data) {
        return "Something went wrong. Please try again.";
    }

    if (typeof data === "string") {
        return data;
    }

    if (Array.isArray(data)) {
        return data.map(getErrorMessage).join(" ");
    }

    if (typeof data === "object") {
        return getErrorMessage(Object.values(data)[0]);
    }

    return "Something went wrong. Please try again.";
};

const Profile = () => {
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
    });

    const [passwordData, setPasswordData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setToast("");
        setSavingProfile(true);

        try {
            const response = await updateProfile({
                first_name: profile.first_name.trim(),
                last_name: profile.last_name.trim(),
            });

            updateUser(response.data);

            setProfile({
                first_name: response.data.first_name || "",
                last_name: response.data.last_name || "",
            });

            setToast("Profile updated successfully.");
        } catch (err) {
            setError(getErrorMessage(err.response?.data));
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setToast("");

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("New passwords do not match.");
            return;
        }

        if (passwordData.new_password.length < 8) {
            setError("New password must contain at least 8 characters.");
            return;
        }

        if (passwordData.old_password === passwordData.new_password) {
            setError("New password must be different from the current password.");
            return;
        }

        setSavingPassword(true);

        try {
            await changePassword(passwordData);

            setPasswordData({
                old_password: "",
                new_password: "",
                confirm_password: "",
            });

            setToast("Password changed successfully.");
        } catch (err) {
            setError(getErrorMessage(err.response?.data));
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="profile-container">
            <h1>My Profile</h1>
            <p>Manage your personal information and password.</p>

            <Toast
                message={toast}
                type="success"
                onClose={() => setToast("")}
            />

            {error && (
                <div className="error-message" role="alert">
                    {error}
                </div>
            )}

            <form className="profile-form" onSubmit={handleProfileSubmit}>
                <h2>Personal Information</h2>

                <label htmlFor="first-name">First Name</label>
                <input
                    id="first-name"
                    type="text"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                    maxLength={150}
                />

                <label htmlFor="last-name">Last Name</label>
                <input
                    id="last-name"
                    type="text"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                    maxLength={150}
                />

                <label htmlFor="profile-email">Email</label>
                <input
                    id="profile-email"
                    type="email"
                    value={user?.email || ""}
                    readOnly
                />

                <button type="submit" disabled={savingProfile}>
                    {savingProfile ? "Saving..." : "Update Profile"}
                </button>
            </form>

            <form className="profile-form" onSubmit={handlePasswordSubmit}>
                <h2>Change Password</h2>

                <label htmlFor="old-password">Current Password</label>
                <input
                    id="old-password"
                    type="password"
                    name="old_password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    autoComplete="current-password"
                    required
                />

                <label htmlFor="new-password">New Password</label>
                <input
                    id="new-password"
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                />

                <label htmlFor="confirm-password">
                    Confirm New Password
                </label>
                <input
                    id="confirm-password"
                    type="password"
                    name="confirm_password"
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    minLength={8}
                    autoComplete="new-password"
                    required
                />

                <button type="submit" disabled={savingPassword}>
                    {savingPassword ? "Updating..." : "Change Password"}
                </button>
            </form>
        </div>
    );
};

export default Profile;


