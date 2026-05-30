import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSitterById } from "../api/sitters";
import { getMyDogs } from "../api/dogs";
import { createBooking, createCheckoutSession } from "../api/bookings";
import type { Sitter, Dog } from "../types";

export default function BookingForm() {
  const { sitterId } = useParams<{ sitterId: string }>();
  const navigate = useNavigate();
  const [sitter, setSitter] = useState<Sitter | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDogId, setSelectedDogId] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sitterId) return;
    Promise.all([getSitterById(sitterId!), getMyDogs()])
      .then(([sitterData, dogsData]) => {
        setSitter(sitterData);
        setDogs(dogsData);
      })
      .catch(() => setError("Couldn't load booking details."))
      .finally(() => setLoading(false));
  }, [sitterId]);

  const nights =
    startDate && endDate
      ? Math.max(
          0,
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : 0;

  // nightly_rate is stored in cents — convert to dollars for display
  const rateInCents = sitter?.sitter_profile?.nightly_rate ?? 15000;
  const rateInDollars = rateInCents / 100;
  const totalPrice = nights * rateInDollars;

  const handleSubmit = async () => {
    if (!selectedDogId || !startDate || !endDate) {
      setError("Please fill in all fields.");
      return;
    }
    if (new Date(startDate) < new Date(today)) {
      setError("Start date cannot be in the past.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const booking = await createBooking({
        sitter_id: sitterId!,
        dog_id: selectedDogId,
        start_date: startDate,
        end_date: endDate,
      });
      const checkoutUrl = await createCheckoutSession(booking.id);
      window.location.href = checkoutUrl;
    } catch {
      setError("Failed to create booking. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );

  if (error && !sitter)
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">
      {/* Back button */}
      <div className="w-full max-w-md mb-3">
        <button
          onClick={() => navigate(`/sitters/${sitterId}`)}
          className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          ← Back to profile
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-5">
          <h1 className="text-base font-semibold text-white">
            Book {sitter?.name}
          </h1>
          <p className="text-xs text-amber-100 mt-1">
            ${rateInDollars.toFixed(0)} / night
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Your Dog
            </label>
            <select
              value={selectedDogId}
              onChange={(e) => setSelectedDogId(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="">Select a dog</option>
              {dogs.map((dog) => (
                <option key={dog.id} value={dog.id}>
                  {dog.name} ({dog.breed})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Start Date
            </label>
            <input
              type="date"
              min={today}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              End Date
            </label>
            <input
              type="date"
              min={today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {nights > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm">
              <p className="text-stone-600">
                {nights} night{nights !== 1 ? "s" : ""} × $
                {rateInDollars.toFixed(0)}/night
              </p>
              <p className="font-semibold text-amber-800 text-base mt-1">
                ${totalPrice.toFixed(0)} total
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-full text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Redirecting to payment..." : "Book & Pay"}
          </button>
        </div>
      </div>
    </div>
  );
}
