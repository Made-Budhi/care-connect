import {createContext, type ReactNode, useEffect, useState} from "react";
import {supabase} from "@/lib/supabaseClient.ts";
import type {Session} from "@supabase/supabase-js";
import LoadingSpinner from "@/components/loading-spinner.tsx";

interface AuthState {
    session: Session | null;
    uuid: string | null;
    role: string | null;
    loading: boolean;
}

interface AuthContextType {
    auth: AuthState;
    // setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [auth, setAuth] = useState<AuthState>({
        session: null,
        uuid: null,
        role: null,
        loading: true,
    });

    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({data: {session}}) => {
            const uuid = session?.user?.id ?? null;
            const role = session?.user?.user_metadata?.role ?? null;
            setAuth({session, uuid, role, loading: false})
        })

        // Set up the listener for auth state changes.
        const {data: { subscription }} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const uuid = session?.user?.id ?? null;
                const role = session?.user?.user_metadata?.role ?? null;
                setAuth({session, uuid, role, loading: false})
            }
        )

        return () => {
            // Unsubscribe to avoid memory leaks
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ auth }}>
            {auth.loading ? <div className={"flex justify-center items-center h-screen w-screen"}>
                <LoadingSpinner />
            </div> : children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
