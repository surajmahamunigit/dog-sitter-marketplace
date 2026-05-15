// src/pages/SitterProfile.tsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSitterById } from "../api/sitters";
import type { Sitter } from "../types";

export default function SitterProfile() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [sitter, setSitter] = useState<Sitter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    console.log("sitter id from url:", id);
    console.log("sitter object:", sitter);

    useEffect(() => {
        if (!id) return;

        async function fetchSitter() {
        try {
            const data = await getSitterById(id!);
            setSitter(data);
        } catch (err) {
            setError("Sitter not found.");
        } finally {
            setLoading(false);
        }
        }

        fetchSitter();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
        </div>
    );

    if (error || !sitter) return (
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error ?? "Sitter not found."}</p>
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
        <button
            onClick={() => navigate("/sitters")}
            className="text-sm text-indigo-600 hover:underline mb-6 block"
        >
            ← Back to sitters
        </button>

        <h1 className="text-3xl font-bold">{sitter.name}</h1>

        <button
            onClick={() => navigate(`/book/${sitter.id}`)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 mt-4 block"
        >
            Book {sitter.name}
        </button>

        <p className="text-gray-600 mt-3">{sitter.bio ?? "No bio provided."}</p>

        {sitter.sitter_profile && (
            <div className="mt-6 border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            {sitter.sitter_profile.rate_per_night && (
                <p className="text-indigo-600 font-medium">
                ${sitter.sitter_profile.rate_per_night}/night
                </p>
            )}
            {sitter.sitter_profile.services?.length > 0 && (
                <div className="mt-2">
                <p className="text-sm text-gray-500">Services:</p>
                <ul className="list-disc list-inside text-sm mt-1">
                    {sitter.sitter_profile.services.map((service) => (
                    <li key={service}>{service}</li>
                    ))}
                </ul>
                </div>
            )}
            </div>
        )}
        </div>
    );
}