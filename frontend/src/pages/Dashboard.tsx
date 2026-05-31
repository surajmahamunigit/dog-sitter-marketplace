import { useNavigate } from "react-router-dom";
import { findMatches } from "../api/matches";
import type { MatchResponse } from "../types";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyDogs } from "../api/dogs";
import { getMyBookings, updateBookingStatus } from "../api/bookings";
import type { Dog, Booking } from "../types";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return <p className="p-8">Loading...</p>;
  if (user?.role === "sitter") return <SitterDashboard />;
  return <OwnerDashboard />;
}

function OwnerDashboard() {
  const { user } = useAuth();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDogId, setSelectedDogId] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  async function handleFindMatches() {
    if (!selectedDogId) return;
    setMatching(true);
    setMatchError(null);
    try {
      const results: MatchResponse = await findMatches(selectedDogId);
      navigate("/matches/results", { state: { results } });
    } catch (err: any) {
      const msg =
        err.response?.data?.detail ?? "Something went wrong. Please try again.";
      setMatchError(msg);
    } finally {
      setMatching(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [dogsData, bookingsData] = await Promise.all([
          getMyDogs(),
          getMyBookings(),
        ]);
        setDogs(dogsData);
        setBookings(bookingsData);
      } catch {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Welcome header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage your pets, bookings, and AI care profiles.
          </p>
        </div>
        <Link
          to="/sitters"
          className="text-sm text-amber-700 font-semibold hover:text-amber-600"
        >
          Browse Sitters →
        </Link>
      </div>

      {/* AI Smart Match block */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(135deg, #b45309 0%, #d97706 60%, #f59e0b 100%)",
          boxShadow: "0 4px 16px rgba(180,83,9,0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white mb-1">
              AI Smart Match
            </h2>
            <p className="text-xs text-amber-100 leading-relaxed max-w-sm">
              Our AI finds the highest-rated caregivers in your area based on
              your pet's needs, routines, and care profile.
            </p>
            <ul className="mt-3 space-y-1">
              {[
                "Matches based on your pet's needs",
                "Top-rated & verified sitters",
                "AI chat support during care",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-xs text-amber-100"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white inline-block flex-shrink-0"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {!showPicker && (
            <button
              onClick={() => setShowPicker(true)}
              className="flex-shrink-0 bg-white text-amber-700 text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer hover:bg-amber-50 transition-colors"
            >
              Find AI Match →
            </button>
          )}
        </div>

        {showPicker && (
          <div className="bg-amber-800 bg-opacity-40 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Which dog are you finding a sitter for?
            </h3>
            {dogs.map((dog) => (
              <label
                key={dog.id}
                className="flex items-center gap-2 mb-2 cursor-pointer text-amber-100 text-sm"
              >
                <input
                  type="radio"
                  name="dogPicker"
                  value={dog.id}
                  checked={selectedDogId === dog.id}
                  onChange={(e) => setSelectedDogId(e.target.value)}
                />
                {dog.name}
              </label>
            ))}
            {matchError && (
              <div className="text-sm mt-2">
                <p className="text-red-200">{matchError}</p>
                {matchError.includes("location") && (
                  <a
                    href="/owner/edit-profile"
                    className="text-white underline"
                  >
                    Add your location →
                  </a>
                )}
              </div>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleFindMatches}
                disabled={!selectedDogId || matching}
                className="bg-white text-amber-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-amber-50 disabled:opacity-50 cursor-pointer"
              >
                {matching ? "Claude is thinking..." : "Find Matches"}
              </button>
              <button
                onClick={() => {
                  setShowPicker(false);
                  setMatchError(null);
                }}
                className="text-amber-100 hover:text-white text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account management */}
      <div className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">
            👤
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900">
              Account Management
            </p>
            <p className="text-xs text-stone-400">
              Update your personal information and preferences.
            </p>
          </div>
        </div>
        <Link
          to="/owner/edit-profile"
          className="text-sm font-medium text-stone-600 hover:text-stone-900 border border-stone-200 px-4 py-1.5 rounded-full transition-colors"
        >
          Edit Profile →
        </Link>
      </div>

      {/* Dogs section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-900">My Dogs</h2>
          <Link
            to="/dogs/new"
            className="text-sm font-medium text-amber-700 border border-amber-200 px-4 py-1.5 rounded-full hover:bg-amber-50 transition-colors"
          >
            + Add Dog
          </Link>
        </div>
        {dogs.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-2">🐶</div>
            <p className="text-stone-400 text-sm">No dogs yet.</p>
            <Link
              to="/dogs/new"
              className="text-amber-600 text-sm hover:underline mt-1 inline-block"
            >
              Add your first dog →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">
                    🐶
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-900">
                      {dog.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {dog.breed} · {dog.age} yrs
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/dogs/${dog.id}/edit-profile`}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs font-medium transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to={`/care-instructions/${dog.id}`}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-xs font-medium transition-colors"
                  >
                    Care Instructions
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookings section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-900">My Bookings</h2>
        </div>
        {bookings.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-stone-400 text-sm">No bookings yet.</p>
            <Link
              to="/sitters"
              className="text-amber-600 text-sm hover:underline mt-1 inline-block"
            >
              Find a sitter →
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">
                    🐾
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-stone-900">
                      {booking.dog_name}
                    </p>
                    <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                      📅{" "}
                      {new Date(booking.start_date).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                      {" → "}
                      {new Date(booking.end_date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                        booking.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : booking.status === "awaiting_payment"
                              ? "bg-orange-100 text-orange-700"
                              : booking.status === "completed"
                                ? "bg-stone-100 text-stone-500"
                                : "bg-red-100 text-red-500"
                      }`}
                    >
                      {booking.status === "awaiting_payment"
                        ? "Awaiting Payment"
                        : booking.status}
                    </span>
                    {booking.status === "awaiting_payment" && (
                      <button
                        onClick={() => navigate(`/book/${booking.sitter_id}`)}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                      >
                        Complete Payment
                      </button>
                    )}
                    {booking.status === "cancelled" && (
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        Refunded
                      </span>
                    )}
                    {booking.status === "completed" && !booking.has_review && (
                      <button
                        onClick={() => navigate(`/review/${booking.id}`)}
                        className="text-xs font-medium px-3 py-1 rounded-full bg-amber-600 hover:bg-amber-700 text-white cursor-pointer"
                      >
                        Leave a Review
                      </button>
                    )}
                    {booking.status === "completed" && booking.has_review && (
                      <span className="text-xs text-stone-400">Reviewed</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function SitterDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch {
        setError("Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleStatusChange(bookingId: string, newStatus: string) {
    try {
      const updated = await updateBookingStatus(bookingId, newStatus);
      setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
    } catch {
      alert("Failed to update booking status.");
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back button or header outside the card */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              Manage your bookings and care sessions.
            </p>
          </div>
          <Link
            to="/sitter/edit-profile"
            className="text-sm font-medium text-amber-700 border border-amber-200 px-4 py-1.5 rounded-full hover:bg-amber-50 transition-colors"
          >
            Edit Profile →
          </Link>
        </div>

        {/* Single white card wrapping all content */}

        {/* Active Bookings */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Active Bookings
          </h2>
          {bookings.filter(
            (b) => b.status === "pending" || b.status === "confirmed",
          ).length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-stone-400 text-sm">No active bookings yet.</p>
            </div>
          ) : (
            <ul className="space-y-4">
              {bookings
                .filter(
                  (b) => b.status === "pending" || b.status === "confirmed",
                )
                .sort(
                  (a, b) =>
                    new Date(b.start_date).getTime() -
                    new Date(a.start_date).getTime(),
                )
                .map((booking) => (
                  <li
                    key={booking.id}
                    className="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          {booking.owner_name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          🐾 {booking.dog_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">
                          {new Date(booking.start_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                          {" → "}
                          {new Date(booking.end_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                        <span
                          className={`inline-block mt-1 text-xs font-medium px-3 py-0.5 rounded-full capitalize ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "confirmed")
                            }
                            className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full text-xs font-medium cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "cancelled")
                            }
                            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "completed")
                            }
                            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full text-xs font-medium cursor-pointer"
                          >
                            Mark Complete
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(booking.id, "cancelled")
                            }
                            className="px-4 py-1.5 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #04342C 0%, #0F6E56 60%, #1D9E75 100%)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-emerald-50">
                          Ask AI about {booking.dog_name}
                        </p>
                        <span className="text-xs text-emerald-300 border border-emerald-700 bg-white/10 rounded-full px-2 py-0.5">
                          AI-powered
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        <p className="text-xs text-emerald-400">
                          Personalized guidance for {booking.dog_name}'s stay
                        </p>
                      </div>
                      <p className="text-xs text-emerald-200 leading-relaxed mb-4">
                        Get instant insights about routines, feeding, behaviour,
                        energy levels, and personalized care instructions.
                      </p>
                      <button
                        onClick={() => navigate(`/chat/${booking.id}`)}
                        className="bg-emerald-50 text-emerald-900 text-sm font-medium rounded-full px-4 py-1.5 cursor-pointer hover:bg-white transition-colors"
                      >
                        Ask AI →
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>

        <div className="pt-2" />

        {/* Past Bookings */}
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Past Bookings
          </h2>
          {bookings.filter(
            (b) => b.status === "completed" || b.status === "cancelled",
          ).length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-stone-400 text-sm">No past bookings yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {bookings
                .filter(
                  (b) => b.status === "completed" || b.status === "cancelled",
                )
                .sort(
                  (a, b) =>
                    new Date(b.start_date).getTime() -
                    new Date(a.start_date).getTime(),
                )
                .map((booking) => (
                  <li
                    key={booking.id}
                    className="bg-stone-50 border border-stone-200 rounded-2xl px-5 py-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-stone-900">
                          {booking.owner_name}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">
                          🐾 {booking.dog_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">
                          {new Date(booking.start_date).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                          {" → "}
                          {new Date(booking.end_date).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}
                        </p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <span
                            className={`text-xs font-medium px-3 py-0.5 rounded-full capitalize ${
                              booking.status === "completed"
                                ? "bg-stone-100 text-stone-500"
                                : "bg-red-100 text-red-500"
                            }`}
                          >
                            {booking.status}
                          </span>
                          {booking.status === "cancelled" && (
                            <span className="text-xs font-medium px-3 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              Refunded
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
