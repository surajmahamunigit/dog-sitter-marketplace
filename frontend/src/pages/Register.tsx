import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole =
    searchParams.get("role") === "sitter" ? "sitter" : "owner";
  const [role, setRole] = useState<"owner" | "sitter">(initialRole);
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
            <label className="block text-sm font-medium text-amber-800 mb-2">
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
            <label className="block text-sm font-medium text-amber-800 mb-2">
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
            <label className="block text-sm font-medium text-amber-800 mb-3">
              Select your account type
            </label>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setRole("owner")}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors cursor-pointer ${
                  role === "owner"
                    ? "border-amber-600 bg-amber-50 border-2"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {role === "owner" ? (
                    <div className="w-4 h-4 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-stone-300 flex-shrink-0" />
                  )}
                  <span className="text-lg">🐶</span>
                  <span
                    className={`text-sm font-medium ${role === "owner" ? "text-amber-800" : "text-stone-800"}`}
                  >
                    Pet Owner
                  </span>
                </div>
                <p
                  className={`text-xs pl-6 leading-relaxed ${role === "owner" ? "text-amber-700" : "text-stone-400"}`}
                >
                  Find AI-matched sitters for your dog.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole("sitter")}
                className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors cursor-pointer ${
                  role === "sitter"
                    ? "border-amber-600 bg-amber-50 border-2"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {role === "sitter" ? (
                    <div className="w-4 h-4 rounded-full bg-amber-700 flex items-center justify-center flex-shrink-0">
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-stone-300 flex-shrink-0" />
                  )}
                  <span className="text-lg">🦮</span>
                  <span
                    className={`text-sm font-medium ${role === "sitter" ? "text-amber-800" : "text-stone-800"}`}
                  >
                    Pet Sitter
                  </span>
                </div>
                <p
                  className={`text-xs pl-6 leading-relaxed ${role === "sitter" ? "text-amber-700" : "text-stone-400"}`}
                >
                  Get matched with pets that fit your experience.
                </p>
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
