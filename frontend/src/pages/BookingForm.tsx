import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSitterById } from "../api/sitters";
import { getMyDogs } from "../api/dogs";
import { createBooking, createCheckoutSession } from "../api/bookings";
import type { Sitter, Dog } from "../types";

export default function BookingForm() {
    const { sitterId } = useParams<{ sitterId: string }>();
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

        Promise.all([
        getSitterById(sitterId!),
        getMyDogs(),
        ])
        .then(([sitterData, dogsData]) => {
            setSitter(sitterData);
            setDogs(dogsData);
        })
        .catch(() => setError("Couldn't load booking details."))
        .finally(() => setLoading(false));
    }, [sitterId]);

    const nights = startDate && endDate
        ? Math.max(0, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const rate = sitter?.sitter_profile?.rate_per_night ?? 150;
    const totalPrice = nights * rate;

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

    if (loading) return <p className="p-8">Loading...</p>;
    if (error && !sitter) return <p className="p-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-2">Book {sitter?.name}</h1>
        <p className="text-gray-500 mb-6">${rate}/night</p>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1">Your Dog</label>
            <select
                value={selectedDogId}
                onChange={(e) => setSelectedDogId(e.target.value)}
                className="w-full border rounded px-3 py-2"
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
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
                type="date"
                min={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
                type="date"
                min={today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            {nights > 0 && (
            <div className="bg-gray-50 rounded p-4 text-sm">
                <p>{nights} night{nights !== 1 ? "s" : ""} × ${rate}/night</p>
                <p className="font-semibold text-lg mt-1">${totalPrice} total</p>
            </div>
            )}

            <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
            {submitting ? "Redirecting to payment..." : "Book & Pay"}
            </button>
        </div>
        </div>
    );
}