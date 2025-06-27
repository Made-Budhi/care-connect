import useAuth from '@/hooks/useAuth';
import {axiosPublic} from "@/lib/axios";

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    return async () => {
        const response = await axiosPublic.get('/auth/v1/refresh-token', {
            // We send the HttpOnly cookie automatically
            withCredentials: true
        });

        // Update the auth context with the new user data and token
        setAuth(prev => {
            return {
                ...prev,
                uuid: response.data.uuid,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                accessToken: response.data.accessToken
            }
        });

        // Return the new access token so the interceptor can use it
        return response.data.accessToken;
    };
};

export default useRefreshToken;