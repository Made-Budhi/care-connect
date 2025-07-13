/**
 * This file is not needed in this experimental branch
 */

import { useEffect, useState } from 'react';
import { Outlet } from "react-router";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/loading-spinner.tsx';

const AuthInitializer = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                // This call will use the HttpOnly cookie and get a new access token
                await refresh();
            } catch (err) {
                // This is an expected error if the user has no valid refresh token
                console.error(err);
            } finally {
                // Ensure we don't try to set state on an unmounted component
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        // If we don't have an access token in memory, try to get one.
        // If we *do* have one (e.g., from client-side navigation), don't show a loader.
        if (!auth?.session) {
            verifyRefreshToken();
        } else {
            setIsLoading(false);
        }

        return () => {
            isMounted = false;
        };
    }, []); // The empty dependency array ensures this runs only once on mount

    return (
        <>
            {isLoading
                ? (
                    <div className={"flex justify-center items-center h-screen w-screen"}>
                        <LoadingSpinner />
                    </div>
                )
                : <Outlet />
            }
        </>
    );
};

export default AuthInitializer;