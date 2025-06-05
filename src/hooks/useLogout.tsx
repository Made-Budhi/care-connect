import {axiosPrivate} from "@/lib/axios";
import useAuth from "./useAuth";

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        setAuth({});
        try {
            const response = await axiosPrivate('auth/v1/logout', {
                withCredentials: true
            });
            console.log(response);
        } catch (err) {
            console.error("From useLogout.tsx: " + err);
        }
    }

    return logout;
}

export default useLogout