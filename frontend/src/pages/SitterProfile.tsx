import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSitterById } from "../api/sitters";
import { getSitterReviews } from "../api/reviews";
import type { Sitter } from "../types";
import type { Review } from "../api/reviews";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= rating ? "text-amber-400" : "text-stone-300"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function SitterProfile() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      try {
        const [sitterData, reviewsData] = await Promise.all([
          getSitterById(id!),
          getSitterReviews(id!),
        ]);
        setSitter(sitterData);
        setReviews(reviewsData);
      } catch (err) {
        setError("Sitter not found.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-stone-500">Loading...</p>
      </div>
    );

  if (error || !sitter)
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-red-500">{error ?? "Sitter not found."}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/sitters")}
            className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            ← Back to sitters
          </button>
        </div>

        {/* Outer card wrapping all content */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-5">
          {/* Hero */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-medium text-lg flex-shrink-0">
                {getInitials(sitter.name)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-stone-800">
                  {sitter.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {sitter.location?.city && (
                    <p className="text-sm text-stone-500">
                      {sitter.location.city}, {sitter.location.state}
                    </p>
                  )}
                  {sitter.average_rating != null && (
                    <div className="flex items-center gap-1">
                      <span className="text-stone-300">·</span>
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-medium text-stone-700">
                        {sitter.average_rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({sitter.review_count}{" "}
                        {sitter.review_count === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/book/${sitter.id}`)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-1.5 px-6 rounded-full cursor-pointer flex-shrink-0"
            >
              Book
            </button>
          </div>

          <hr className="border-stone-100" />

          {/* About */}
          <div>
            <h2 className="text-sm font-medium text-stone-700 mb-2">About</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {sitter.bio || "This sitter hasn't added a bio yet."}
            </p>
          </div>

          <hr className="border-stone-100" />

          {/* Details */}
          <div>
            <h2 className="text-sm font-medium text-stone-700 mb-3">Details</h2>
            {sitter.sitter_profile ? (
              <>
                {sitter.sitter_profile.nightly_rate > 0 && (
                  <p className="text-amber-700 font-medium text-sm mb-3">
                    ${(sitter.sitter_profile.nightly_rate / 100).toFixed(0)} /
                    night
                  </p>
                )}
                {sitter.sitter_profile.services?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sitter.sitter_profile.services.map((service: string) => (
                      <span
                        key={service}
                        className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full border border-amber-200"
                      >
                        {service.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-stone-400">
                This sitter hasn't set up their profile yet.
              </p>
            )}
          </div>

          {/* AI summary */}
          {sitter.ai_summary && (
            <>
              <hr className="border-stone-100" />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">
                  ✦ AI summary
                </p>
                <p className="text-sm text-amber-900 leading-relaxed">
                  {sitter.ai_summary}
                </p>
              </div>
            </>
          )}

          <hr className="border-stone-100" />

          {/* Reviews */}
          <div>
            <p className="text-sm font-medium text-stone-700 mb-3">
              Reviews ({reviews.length})
            </p>
            {reviews.length === 0 ? (
              <p className="text-sm text-stone-400">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border-b border-stone-100 pb-4 last:border-0 last:pb-0"
                  >
                    <StarDisplay rating={review.rating} />
                    <p className="text-sm text-stone-700 leading-relaxed mt-2 mb-1">
                      {review.body}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
