import {createContext, type ReactNode, useEffect, useState} from "react";
import {supabase} from "@/lib/supabaseClient.ts";
import type {Session, User} from "@supabase/supabase-js";
import LoadingSpinner from "@/components/loading-spinner.tsx";

interface AuthState {
    session: Session | null;
    user: User | null;
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
        user: null,
        role: null,
        loading: true,
    });

    useEffect(() => {
        // Get current session
        supabase.auth.getSession().then(({data: {session}}) => {
            const user = session?.user ?? null;
            const role =user?.user_metadata?.role ?? null;
            setAuth({session, user, role, loading: false})
        })

        // Set up the listener for auth state changes.
        const {data: { subscription }} = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const user = session?.user ?? null;
                const role =user?.user_metadata?.role ?? null;
                setAuth({session, user, role, loading: false})
            }
        )

        return () => {
            // Unsubscribe to avoid memory leaks
            subscription.unsubscribe()
        }
    }, [])

    return (
        <AuthContext.Provider value={{ auth }}>
            {auth.loading ? <LoadingSpinner /> : children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
