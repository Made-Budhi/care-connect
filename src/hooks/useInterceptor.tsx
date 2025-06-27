import { axiosPrivate } from "@/lib/axios";
import { useEffect } from "react";
import useRefreshToken from "@/hooks/useRefreshToken";
import useAuth from "@/hooks/useAuth";

const useAxiosPrivate = () => {
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        // Interceptor to add the Authorization header to outgoing requests
        const requestIntercept = axiosPrivate.interceptors.request.use(
            config => {
                // If the Authorization header is not already set, set it with the current access token
                if (!config.headers['Authorization']) {
                    config.headers['Authorization'] = `Bearer ${auth?.accessToken}`;
                }
                return config;
            }, (error) => Promise.reject(error)
        );

        // Interceptor to handle responses, specifically for token expiration
        const responseIntercept = axiosPrivate.interceptors.response.use(
            // If the response is successful, just return it
            response => response,
            // If there's an error, handle it
            async (error) => {
                const prevRequest = error?.config;
                // Check if the error is a 401 (Unauthorized) and if we haven't already retried this request
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true; // Mark the request as having been retried
                    try {
                        const newAccessToken = await refresh(); // Get a new access token
                        prevRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // Update the header
                        return axiosPrivate(prevRequest); // Retry the original request with the new token
                    } catch (refreshError) {
                        // If refreshing the token fails, it's a final failure.
                        // The user will be redirected to login by other parts of the app.
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        // Cleanup function to remove the interceptors when the component unmounts
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);
        }
    }, [auth, refresh])

    return axiosPrivate;
}

export default useAxiosPrivate;