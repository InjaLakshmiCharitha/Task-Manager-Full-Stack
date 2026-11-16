import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext.jsx";

import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import Categories from "./pages/Categories";
import Profile from "./pages/Profile";
import Kanban from "./pages/kanban";
import NotFound from "./pages/NotFound";

const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main className="page-content">
                <Outlet />
            </main>
        </>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route
                                path="/"
                                element={<Navigate to="/dashboard" replace />}
                            />

                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/tasks/new" element={<TaskForm />} />
                            <Route path="/tasks/:id/edit" element={<TaskForm />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/kanban" element={<Kanban />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
};

export default App;



