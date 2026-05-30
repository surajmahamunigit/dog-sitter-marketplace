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
    <nav className="w-full border-b border-stone-200 bg-white px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-amber-600">
        PawSitter
      </Link>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-amber-600 hover:text-amber-700 border border-amber-300 px-4 py-1.5 rounded-full hover:bg-amber-50 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full transition-colors"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
