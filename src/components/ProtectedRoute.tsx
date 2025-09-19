import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

export default function ProtectedRoute({children, requiredRole,}: {
    children: ReactNode;
    requiredRole: "admin" | "employee";
    }) {

    const { role } = useAuth();

    if (!role) {
        return <Navigate to="/" replace />;
    }

    if (role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return children;
}
