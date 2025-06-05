import {createContext, type ReactNode, useState, useEffect} from "react";

interface AuthState {
    uuid?: string;
    name?: string;
    email?: string;
    role?: string;
    accessToken?: string;
}

interface AuthContextType {
    auth: AuthState;
    setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
}

const AUTH_STORAGE_KEY = 'authData';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize auth state from localStorage if available
    const [auth, setAuth] = useState<AuthState>(() => {
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        return storedAuth ? JSON.parse(storedAuth) : {};
    });

    // Update localStorage when auth state changes
    useEffect(() => {
        if (auth?.accessToken) {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
        } else {
            localStorage.removeItem(AUTH_STORAGE_KEY);
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
