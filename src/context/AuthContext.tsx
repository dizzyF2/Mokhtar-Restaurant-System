import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthState {
    role: "admin" | "employee" | null;
    employeeId: number | null;
    employeeName: string | null;
}

interface AuthContextType extends AuthState {
    login: (data: Partial<AuthState>) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [auth, setAuth] = useState<AuthState>({
        role: null,
        employeeId: null,
        employeeName: null,
    });

    useEffect(() => {
        const savedAuth = localStorage.getItem("auth");
        if (savedAuth) {
        setAuth(JSON.parse(savedAuth));
        }
    }, []);

    const login = (data: Partial<AuthState>) => {
        setAuth((prev) => {
        const newAuth = { ...prev, ...data };
        localStorage.setItem("auth", JSON.stringify(newAuth));
        return newAuth;
        });
    };

    const logout = () => {
        const resetAuth: AuthState = {
        role: null,
        employeeId: null,
        employeeName: null,
        };
        setAuth(resetAuth);
        localStorage.removeItem("auth");
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}