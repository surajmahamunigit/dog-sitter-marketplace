import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"owner" | "sitter">("owner");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await client.post("/auth/register", { name, email, password, role });
      const loginResponse = await client.post("/auth/login", {
        email,
        password,
      });
      setToken(loginResponse.data.access_token);

      const userResponse = await client.get("/users/me", {
        headers: { Authorization: `Bearer ${loginResponse.data.access_token}` },
      });
      setUser(userResponse.data);

      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail ?? "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-md p-8">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-xl">
          🐾
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-1 text-center">
          Create account
        </h1>
        <p className="text-stone-400 text-sm mb-8 text-center">
          Find or become a dog sitter
        </p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Jane Smith"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              I want to
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  role === "owner"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-stone-600 border-stone-300 hover:border-amber-400"
                }`}
              >
                Find a sitter
              </button>
              <button
                type="button"
                onClick={() => setRole("sitter")}
                className={`py-2.5 rounded-full text-sm font-medium border transition-colors ${
                  role === "sitter"
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-amber-800 border-stone-300 hover:border-amber-400"
                }`}
              >
                Become a sitter
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2 mx-auto block bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-stone-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
