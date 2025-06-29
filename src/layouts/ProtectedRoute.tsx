import { useLocation, Navigate, Outlet } from "react-router";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/loading-spinner.tsx";

type allowedRoles = {
    roles?: string[];
}

const RequireAuth = ({ roles }:  allowedRoles)  => {
    const { auth } = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return (
            <LoadingSpinner />
        )
    }

    const userRole = auth.role;

    const isAuthorized = roles && userRole && roles.includes(userRole);

    if (auth.session) {
        if (isAuthorized) {
            return <Outlet />;
        } else {
            return <Navigate to={"/unauthorized"} state={{from: location}} replace />;
        }
    }

    return <Navigate to={"/login"} state={{from: location}} replace />;
}

export default RequireAuth;