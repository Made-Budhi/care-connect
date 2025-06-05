import {useContext, useDebugValue} from "react";
import AuthContext from "@/context/AuthContext";

const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    useDebugValue(context.auth, (auth) => auth?.accessToken ? "Logged In" : "Logged Out")

    return context;
}

export default useAuth;