import { Outlet } from "react-router";
import { useState, useEffect } from "react";
import useRefreshToken from "@/hooks/useRefreshToken";
import useAuth from "@/hooks/useAuth";
import LoadingSpinner from "@/components/loading-spinner.tsx";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth(); // Ensure persist exists in useAuth()

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        // Ensures refresh logic runs only when necessary
        if (!auth?.accessToken) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, [auth?.accessToken, refresh]);

    // useEffect(() => {
    //     console.log(`isLoading: ${isLoading}`);
    //     console.log(`aT: ${JSON.stringify(auth?.accessToken)}`);
    // }, [auth?.accessToken, isLoading]);

    return (
        <>
            {isLoading ? (
                <div className={"flex justify-center items-center h-screen w-screen"}>
                    <LoadingSpinner />
                </div>
            ) : <Outlet />}
        </>
    );
};

export default PersistLogin;
