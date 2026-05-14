import { createContext, useContext, useState, ReactNode } from "react"


// Shape of the data AuthContext holds
interface AuthContextType{
    token: string | null
    setToken: (token: string | null) => void
    isAuthenticated: boolean
}

// Create the context 
const AuthContext = createContext<AuthContextType | null>(null)

// The provider wraps the whole app and makes the token available everywhere
export function AuthProvider({ children }: { children: ReactNode}) {
    const[ token, setTokenState ] = useState<string | null>(localStorage.getItem("token"))

    const setToken = (newToken: string | null) => {
        setTokenState(newToken)
        if (newToken){
            localStorage.setItem("token", newToken)
        }else{
            localStorage.removeItem("token")
        }
    }

    return (
        <AuthContext.Provider value={{token, setToken, isAuthenticated: !!token}}>
            {children}
        </AuthContext.Provider>
    )
}


// Custom hook - how any component reads the auth state 
export function useAuth() {
    const context = useContext(AuthContext)

    if( !context ) throw new Error("useAuth must be used inside AuthProvider")
    
    return context
}

