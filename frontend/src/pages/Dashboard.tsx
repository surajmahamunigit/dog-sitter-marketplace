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
        const [dogs, setDogs] = useState<Dog[]>([]);
        const [bookings, setBookings] = useState<Booking[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

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
            <h1 className="text-3xl font-bold">My Dashboard</h1>

            <Link
                to="/sitters"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
                Find a Sitter
            </Link>

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
                    <li key={dog.id} className="border rounded p-3">
                        {dog.name} — {dog.breed}, {dog.age} yrs
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
                        <p>
                        {booking.start_date} → {booking.end_date}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                        Status: {booking.status}
                        </p>
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
