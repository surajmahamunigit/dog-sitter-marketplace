import { useLocation, useNavigate } from "react-router-dom";
import type { MatchResponse, SitterMatch } from "../types";

export default function MatchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const results: MatchResponse | undefined = location.state?.results;

  if (!results) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
          <p className="text-stone-500 mb-4">No match results found.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-amber-700 hover:underline text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-sm px-4 py-2 rounded-full cursor-pointer transition-colors mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-stone-900">
            Claude's Top Picks
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Based on your dog's profile, here are the best matches.
          </p>
        </div>

        {/* Match cards */}
        {results.matches.map((match: SitterMatch) => (
          <div
            key={match.sitter_id}
            className="bg-white border border-stone-200 rounded-2xl shadow-sm overflow-hidden"
          >
            {/* Rank badge + name */}
            <div className="px-6 pt-5 pb-4 flex justify-between items-start">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-amber-600">
                  #{match.rank} Match
                </span>
                <h2 className="text-lg font-semibold text-stone-900 mt-0.5">
                  {match.sitter_name}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-amber-700">
                  ${(match.nightly_rate / 100).toFixed(0)} / night
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  {match.distance_miles.toFixed(1)} miles away
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="px-6 pb-4">
              <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                <blockquote className="border-l-4 border-amber-300 pl-4 text-sm text-amber-900 leading-relaxed">
                  {match.reasoning}
                </blockquote>
              </div>
            </div>

            {/* Book button */}
            <div className="px-6 pb-5">
              <button
                onClick={() => navigate(`/book/${match.sitter_id}`)}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-6 py-2 rounded-full cursor-pointer transition-colors"
              >
                Book {match.sitter_name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
