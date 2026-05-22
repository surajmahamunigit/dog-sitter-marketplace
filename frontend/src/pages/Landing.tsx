import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Landing() {
    // Check if user is already logged in
    const { isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen bg-white">


        {/* Hero section */}
        <div className="max-w-3xl mx-auto text-center px-8 pt-24 pb-16">
            
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6 font-display">
                Pet Care Reimagined
            </h1>
            <p className="text-xl text-gray-500 mb-10">
            Experience a new era of pet ownership with PawSitter. Our AI-driven platform connects you with the perfect sitter, ensuring your furry friends are never alone.
            </p>
            <div className="flex gap-4 justify-center">
            <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl text-base font-medium hover:bg-blue-700 transition-colors"
            >
                Find a sitter
            </Link>
            <Link
                to="/register?role=sitter"
                className="bg-gradient-to-r from-orange-400 to-pink-400 text-white px-8 py-3 rounded-xl text-base font-medium hover:from-orange-500 hover:to-pink-500 transition-colors"
            >
                Become a sitter
            </Link>
            </div>
        </div>

        {/* Three feature cards */}
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-3 gap-6 pb-24">
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-4">🐾</div>
                <h3 className="font-semibold text-gray-900 mb-2 font-display">AI-matched sitters</h3>
                <p className="text-sm text-gray-500">
                Our matching engine pairs your dog's breed, energy, and needs with the right sitter.
                </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-4">💬</div>
                <h3 className="font-semibold text-gray-900 mb-2 font-display">AI care assistant</h3>
                <p className="text-sm text-gray-500">
                Write care notes once. Your sitter gets instant AI-powered answers during the stay.
                </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-6">
                <div className="text-3xl mb-4">💳</div>
                <h3 className="font-semibold text-gray-900 mb-2 font-display">Secure payments</h3>
                <p className="text-sm text-gray-500">
                    Book and pay safely via Stripe. Automatic refunds if you need to cancel.
                </p>
            </div>
        </div>

        </div>
    )
}