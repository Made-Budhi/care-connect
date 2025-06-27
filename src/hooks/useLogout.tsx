import {useNavigate} from "react-router";
import {axiosPrivate} from "@/lib/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();

    return async () => {
        // Clear the auth state in the frontend immediately.
        // This is the most important step for the UI to react correctly.
        setAuth({});

        // Use replace: true to prevent the user from navigating back to the logged-in state.
        navigate('/', {replace: true});

        try {
            // Send the request to the backend to invalidate the session.
            // This can happen in the background and does not need to block the user's navigation.
            await axiosPrivate.post('/auth/v1/logout', {}, {
                withCredentials: true
            });
        } catch (err) {
            // Even if the server call fails, the user is logged out on the client.
            // This is a safe and robust approach.
            console.error("Server logout failed:", err);
        }
    };
};

export default useLogout;