import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { isAuthenticated, setToken, setUser } = useAuth();
    const navigate = useNavigate();

    function handleSignOut() {
        setToken(null);
        setUser(null);
        navigate("/");
    }

    return (
        <nav className="w-full border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-gray-900">
            PawSitter
        </Link>

        <div className="flex items-center gap-4">
            {isAuthenticated ? (
            <>
                <Link
                to="/dashboard"
                className="text-sm text-gray-700 hover:text-blue-600"
                >
                Dashboard
                </Link>
                <button
                onClick={handleSignOut}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                >
                Sign Out
                </button>
            </>
            ) : (
            <>
                <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-blue-600"
                >
                Sign In
                </Link>
                <Link
                to="/register"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                Register
                </Link>
            </>
            )}
        </div>
        </nav>
    );
}