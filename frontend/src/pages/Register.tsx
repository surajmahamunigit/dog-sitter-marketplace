import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

export default function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState<'owner' | 'sitter'>('owner')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { setToken } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
        await client.post('/auth/register', { name, email, password, role })
        const loginResponse = await client.post('/auth/login', { email, password })
        setToken(loginResponse.data.access_token)
        navigate('/')
        } catch (err: any) {
        setError(err.response?.data?.detail ?? 'Registration failed. Please try again.')
        } finally {
        setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-full max-w-md p-8">

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create account</h1>
            <p className="text-gray-500 mb-8">Find or become a dog sitter</p>

            {error && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-6">
                {error}
            </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
                </label>
                <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jane Smith"
                required
                />
            </div>

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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                I want to
                </label>
                <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setRole('owner')}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    role === 'owner'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                >
                    Find a sitter
                </button>
                <button
                    type="button"
                    onClick={() => setRole('sitter')}
                    className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    role === 'sitter'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                >
                    Become a sitter
                </button>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
                {loading ? 'Creating account...' : 'Create account'}
            </button>
            </form>

            <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
            </Link>
            </p>
        </div>
        </div>
    )
}