import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { setToken } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
        const response = await client.post('/auth/login', {
        email,
        password,
        })
        setToken(response.data.access_token)
        navigate('/')
    } catch (err: any) {
        setError(err.response?.data?.detail ?? 'Login failed. Please try again.')
    } finally {
        setLoading(false)
    }
    }

    return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h1>
        <p className="text-gray-500 mb-8">Sign in to your account</p>

        {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
            </label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
                required
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
            </label>
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
            />
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
            {loading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:underline">
            Sign up
            </Link>
        </p>
        </div>
    </div>
    )
}
