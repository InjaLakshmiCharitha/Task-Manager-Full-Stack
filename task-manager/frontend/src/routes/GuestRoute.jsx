import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const GuestRoute = () => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default GuestRoute;
