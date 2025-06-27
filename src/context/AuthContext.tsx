import {createContext, type ReactNode, useState} from "react";

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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Initialize auth state from localStorage if available
    const [auth, setAuth] = useState<AuthState>({});

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext;
