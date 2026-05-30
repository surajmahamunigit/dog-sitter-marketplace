import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createReview } from "../api/reviews";

export default function ReviewForm() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (body.trim().length === 0) {
      setError("Please write a review.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createReview(bookingId!, { rating, body });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center px-4">
      {/* Back button */}
      <div className="w-full max-w-lg mb-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          ← Back to dashboard
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-lg p-8">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-xl">
          ⭐
        </div>

        <h1 className="text-2xl font-semibold text-stone-800 mb-1 text-center">
          Leave a Review
        </h1>
        <p className="text-stone-500 text-sm mb-8 text-center">
          Your review helps other owners find great sitters.
        </p>

        {/* Star rating picker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-3">
            Rating
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="text-4xl transition-transform hover:scale-110 cursor-pointer"
              >
                <span
                  className={
                    star <= (hoveredStar || rating)
                      ? "text-amber-400"
                      : "text-stone-300"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm text-stone-500 mt-2">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Written review */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-stone-700 mb-2">
            Your review
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            placeholder="How was the stay? Would you recommend this sitter?"
            className="w-full border border-stone-300 rounded-xl px-4 py-3 text-stone-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-2 rounded-full border border-stone-300 text-stone-600 text-sm font-medium hover:bg-stone-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
