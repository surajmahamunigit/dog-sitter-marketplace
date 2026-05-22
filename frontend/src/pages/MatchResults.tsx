import { useLocation, useNavigate } from 'react-router-dom'
import type { MatchResponse, SitterMatch } from '../types'

export default function MatchResults() {
    const location = useLocation()
    const navigate = useNavigate()
    const results: MatchResponse | undefined = location.state?.results

  // Refresh guard — state is gone, send them back
    if (!results) {
        return (
        <div className="max-w-3xl mx-auto p-8">
            <p className="text-gray-500">No match results found.</p>
            <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:underline"
            >
            Back to Dashboard
            </button>
        </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-bold">Claude's Top Picks</h1>
        <p className="text-gray-500">
            Based on your dog's profile, here are the best matches.
        </p>

        {results.matches.map((match: SitterMatch) => (
            <div key={match.sitter_id} className="border rounded-lg p-6 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                <span className="text-xs font-bold uppercase tracking-wide text-purple-600">
                    #{match.rank} Match
                </span>
                <h2 className="text-xl font-semibold">{match.sitter_name}</h2>
                </div>
                <div className="text-right">
                <p className="font-semibold">${(match.nightly_rate / 100).toFixed(0)}/night</p>
                <p className="text-sm text-gray-500">{match.distance_miles.toFixed(1)} miles away</p>
                </div>
            </div>

            <p className="text-gray-700 italic">"{match.reasoning}"</p>

            <button
                onClick={() => navigate(`/book/${match.sitter_id}`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Book {match.sitter_name}
            </button>
            </div>
        ))}

        <button
            onClick={() => navigate('/dashboard')}
            className="text-gray-500 hover:text-gray-700 text-sm"
        >
            ← Back to Dashboard
        </button>
        </div>
    )
}