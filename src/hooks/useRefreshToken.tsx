import useAuth from '@/hooks/useAuth';
import { axiosPublic } from "@/lib/axios";

const useRefreshToken = () => {
    const { auth, setAuth } = useAuth();

    return async (): Promise<string> => {
        if (!auth?.accessToken) {
            console.error("No access token found! Refresh token request might fail.");
        }

        const response = await axiosPublic.get('/auth/v1/refresh-token', {
            headers: {
                'Authorization': `Bearer ${auth?.accessToken}`
            }
        });

        setAuth((prev) => {
            console.log(JSON.stringify(prev) + "refresh token");
            console.log(response.data.accessToken);
            return {
                ...prev,
                id: response.data.id,
                name: response.data.name,
                email: response.data.email,
                role: response.data.role,
                accessToken: response.data.accessToken
            }
        });

        return response.data.accessToken;
    };
};

export default useRefreshToken;
