import { useNavigate } from 'react-router-dom'
import { findMatches } from '../api/matches'
import type { MatchResponse } from '../types'
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
        const { user } = useAuth()
        const [dogs, setDogs] = useState<Dog[]>([]);
        const [bookings, setBookings] = useState<Booking[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        

        const navigate = useNavigate()
        const [showPicker, setShowPicker] = useState(false)
        const [selectedDogId, setSelectedDogId] = useState('')
        const [matching, setMatching] = useState(false)
        const [matchError, setMatchError] = useState<string | null>(null)


        async function handleFindMatches() {

            if (!selectedDogId) return
            
            setMatching(true)
            setMatchError(null)
            
            try {
                const results: MatchResponse = await findMatches(selectedDogId)
                navigate('/matches/results', { state: { results } })
            } catch (err: any) {
                const msg = err.response?.data?.detail ?? 'Something went wrong. Please try again.'
                setMatchError(msg)
            } finally {
                setMatching(false)
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
            <div className="max-w-3xl mx-auto p-8 space-y-10">

                {/* Top bar */}
                <div className="flex justify-between items-center">
                <p className="text-gray-600">Welcome back, {user?.name}</p>
                <Link to="/sitters" className="font-bold text-blue-600 hover:underline">
                    Find a Sitter →
                </Link>
                </div>

                {/* Hero */}
                <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold">Smart Match: Find Your Perfect Sitter</h1>
                <p className="text-gray-500 max-w-xl mx-auto">
                    Our platform uses powerful AI to find highest-rated caregivers in your area,
                    based on specific pet needs and AI chat support during caregiving.
                </p>

                {!showPicker ? (
                    <button
                        onClick={() => setShowPicker(true)}
                        className="text-white px-5 py-2.5 rounded-lg font-semibold cursor-pointer"
                        style={{ backgroundColor: '#499349' }}
                    >
                    Use AI to Find Sitters
                    </button>
                ) : (
                    <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 text-left max-w-md mx-auto">
                    <h3 className="font-semibold mb-3">Which dog are you finding a sitter for?</h3>

                    {dogs.map(dog => (
                        <label key={dog.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                        <input
                            type="radio"
                            name="dogPicker"
                            value={dog.id}
                            checked={selectedDogId === dog.id}
                            onChange={e => setSelectedDogId(e.target.value)}
                        />
                        {dog.name}
                        </label>
                    ))}

                    {matchError && (
                        <div className="text-sm mt-2">
                        <p className="text-red-600">{matchError}</p>
                        {matchError.includes('location') && (
                            <a href="/owner/edit-profile" className="text-blue-600 hover:underline">
                            Add your location →
                            </a>
                        )}
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <button
                        onClick={handleFindMatches}
                        disabled={!selectedDogId || matching}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                        {matching ? 'Claude is thinking...' : 'Find Matches'}
                        </button>
                        <button
                        onClick={() => { setShowPicker(false); setMatchError(null) }}
                        className="text-gray-500 hover:text-gray-700"
                        >
                        Cancel
                        </button>
                    </div>
                    </div>
                )}
                </div>

                {/* Account management */}
                <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-gray-600">Account Management</p>
                <a href="/owner/edit-profile" className="text-sm text-blue-600 hover:underline block">
                    Edit Profile
                </a>
                </div>

                <hr className="border-gray-200" />

                {/* Dogs section */}
                <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">My Dogs</h2>
                    <Link to="/dogs/new" className="text-sm text-blue-600 hover:underline">
                    + Add Dog
                    </Link>
                </div>
                {dogs.length === 0 ? (
                    <p className="text-gray-500">No dogs yet.</p>
                ) : (
                    <ul className="space-y-2">
                    {dogs.map((dog) => (
                        <li key={dog.id} className="border rounded p-3 flex justify-between items-center">
                        <span>{dog.name} — {dog.breed}, {dog.age} yrs</span>
                        <Link to={`/dogs/${dog.id}/edit-profile`} className="text-sm text-blue-600 hover:underline">
                            Edit Profile
                        </Link>
                        </li>
                    ))}
                    </ul>
                )}
                </section>

                {/* Bookings section */}
                <section>
                <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
                {bookings.length === 0 ? (
                    <p className="text-gray-500">No bookings yet.</p>
                ) : (
                    <ul className="space-y-2">
                    {bookings.map((booking) => (
                        <li key={booking.id} className="border rounded p-3">
                        <p>{booking.start_date} → {booking.end_date}</p>
                        <p className="text-sm text-gray-500 capitalize">Status: {booking.status}</p>
                        </li>
                    ))}
                    </ul>
                )}
                </section>

            </div>
        )
    }

    function SitterDashboard() {
        const [bookings, setBookings] = useState<Booking[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

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
            setBookings(bookings.map((b) =>
                b.id === updated.id ? updated : b
            ));
            } catch {
            alert("Failed to update booking status.");
            }
        }

        if (loading) return <p className="p-8">Loading...</p>;
        if (error) return <p className="p-8 text-red-500">{error}</p>;

        return (
            <div className="max-w-3xl mx-auto p-8 space-y-6">
            <h1 className="text-3xl font-bold">Sitter Dashboard</h1>
            <Link
                to="/sitter/edit-profile"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
                Edit Profile
            </Link>
            <h2 className="text-xl font-semibold">Incoming Bookings</h2>
            {bookings.length === 0 ? (
                <p className="text-gray-500">No bookings yet.</p>
            ) : (
                <ul className="space-y-3">
                {bookings.map((booking) => (
                    <li key={booking.id} className="border rounded p-4 space-y-2">
                    <p>{booking.start_date} → {booking.end_date}</p>
                    <p className="text-sm text-gray-500 capitalize">
                        Status: {booking.status}
                    </p>
                    <div className="flex gap-2">
                        {booking.status === "pending" && (
                        <>
                            <button
                            onClick={() => handleStatusChange(booking.id, "confirmed")}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                            >
                            Confirm
                            </button>
                            <button
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                            >
                            Cancel
                            </button>
                        </>
                        )}
                        {booking.status === "confirmed" && (
                        <>
                            <button
                            onClick={() => handleStatusChange(booking.id, "completed")}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                            >
                            Mark Complete
                            </button>
                            <button
                            onClick={() => handleStatusChange(booking.id, "cancelled")}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                            >
                            Cancel
                            </button>
                        </>
                        )}
                    </div>
                    </li>
                ))}
                </ul>
            )}
            </div>
        );
}
