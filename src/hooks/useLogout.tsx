import {useNavigate} from "react-router";
import {supabase} from "@/lib/supabaseClient";

const useLogout = () => {
    const navigate = useNavigate();

    return async () => {
        try {
            const {error} = await supabase.auth.signOut();
            if (error) throw error.message;
            navigate('/', {replace: true});
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };
};

export default useLogout;