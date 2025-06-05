import { useLocation, Navigate, Outlet } from "react-router";
import useAuth from "@/hooks/useAuth";

type allowedRoles = {
    roles?: string[];
}

const RequireAuth = ({ roles }:  allowedRoles)  => {
    const { auth } = useAuth();
    const location = useLocation();

    const isAuthorized = roles && auth?.role && roles.includes(auth.role);

    if (isAuthorized) {
        return <Outlet />
    }

    return auth?.accessToken ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
    ) : (
        <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;