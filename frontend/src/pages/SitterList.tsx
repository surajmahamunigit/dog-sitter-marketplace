// src/pages/SitterList.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSitters, type Sitter } from "../api/sitters";

export default function SitterList() {
    const [sitters, setSitters] = useState<Sitter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchSitters() {
        try {
            const data = await getSitters();
            setSitters(data);
        } catch (err) {
            setError("Failed to load sitters. Please try again.");
        } finally {
            setLoading(false);
        }
        }

        fetchSitters();
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading sitters...</p>
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Find a Sitter</h1>

        {sitters.length === 0 ? (
            <p className="text-gray-500">No sitters available yet.</p>
        ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sitters.map((sitter) => (
                <div
                key={sitter.id}
                onClick={() => navigate(`/sitters/${sitter.id}`)}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                <h2 className="text-xl font-semibold">{sitter.name}</h2>
                <p className="text-gray-600 mt-1 text-sm line-clamp-2">{sitter.bio}</p>
                {sitter.sitter_profile?.rate_per_night && (
                    <p className="mt-2 text-indigo-600 font-medium">
                    ${sitter.sitter_profile.rate_per_night}/night
                    </p>
                )}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}