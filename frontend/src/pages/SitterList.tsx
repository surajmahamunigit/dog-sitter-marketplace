import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { getSitters } from "../api/sitters";
import type { Sitter } from "../types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const LA_CENTER = { lat: 34.0522, lng: -118.2437 };

export default function SitterList() {
    const [sitters, setSitters] = useState<Sitter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ownerLocation, setOwnerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [locating, setLocating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSitters();
    }, []);

    async function fetchSitters(location?: { lat: number; lng: number }) {
        setLoading(true);
        try {
            const data = await getSitters(location ? { ...location, radius: 25 } : undefined);
            setSitters(data);
        } catch (err) {
            setError("Failed to load sitters. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function handleUseMyLocation() {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setOwnerLocation(location);
                fetchSitters(location);
                setLocating(false);
            },
            () => {
                setError("Could not get your location. Please allow location access.");
                setLocating(false);
            }
        );
    }

    const mapCenter = ownerLocation ?? LA_CENTER;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Find a Sitter</h1>
                <button
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                    {locating ? "Locating..." : "📍 Use My Location"}
                </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Map */}
            <div className="rounded-xl overflow-hidden mb-8 h-72">
                <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                    <Map
                        defaultCenter={mapCenter}
                        defaultZoom={11}
                        mapId="dog-sitter-map"
                        style={{ width: "100%", height: "100%" }}
                    >
                        {sitters.map((sitter) =>
                            sitter.location?.lat && sitter.location?.lng ? (
                                <AdvancedMarker
                                    key={sitter.id}
                                    position={{ lat: sitter.location.lat, lng: sitter.location.lng }}
                                    onClick={() => navigate(`/sitters/${sitter.id}`)}
                                    title={sitter.name}
                                />
                            ) : null
                        )}
                        {ownerLocation && (
                            <AdvancedMarker position={ownerLocation} title="You" />
                        )}
                    </Map>
                </APIProvider>
            </div>

            {/* Sitter cards */}
            {loading ? (
                <p className="text-gray-500">Loading sitters...</p>
            ) : sitters.length === 0 ? (
                <p className="text-gray-500">No sitters found near you.</p>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {sitters.map((sitter) => (
                        <div
                            key={sitter.id}
                            onClick={() => navigate(`/sitters/${sitter.id}`)}
                            className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-xl font-semibold">{sitter.name}</h2>
                            <p className="text-gray-500 text-sm">{sitter.location?.city}</p>
                            {sitter.distance_miles !== null && (
                                <p className="text-indigo-600 text-sm mt-1">
                                    {sitter.distance_miles.toFixed(1)} miles away
                                </p>
                            )}
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