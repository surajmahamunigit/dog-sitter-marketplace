import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { getSitters } from "../api/sitters";
import type { Sitter } from "../types";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? "";
const LA_CENTER = { lat: 34.0522, lng: -118.2437 };

export default function SitterList() {
  const [sitters, setSitters] = useState<Sitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerLocation, setOwnerLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSitters();
  }, []);

  async function fetchSitters(location?: { lat: number; lng: number }) {
    setLoading(true);
    try {
      const data = await getSitters(
        location ? { ...location, radius: 25 } : undefined,
      );
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
      },
    );
  }

  const mapCenter = ownerLocation ?? LA_CENTER;

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>

        {/* White card wrapping all content */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-stone-900">Find a Sitter</h1>
            <button
              onClick={handleUseMyLocation}
              disabled={locating}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-4 py-1.5 rounded-full disabled:opacity-50 transition-colors cursor-pointer"
            >
              {locating ? "Locating..." : "📍 Use My Location"}
            </button>
          </div>

          {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

          {/* Map */}
          <div className="rounded-2xl overflow-hidden mb-6 h-72 border border-stone-200">
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
                      position={{
                        lat: sitter.location.lat,
                        lng: sitter.location.lng,
                      }}
                      onClick={() => navigate(`/sitters/${sitter.id}`)}
                      title={sitter.name}
                    />
                  ) : null,
                )}
                {ownerLocation && (
                  <AdvancedMarker position={ownerLocation} title="You" />
                )}
              </Map>
            </APIProvider>
          </div>

          {/* Sitter cards */}
          {loading ? (
            <p className="text-stone-400 text-sm">Loading sitters...</p>
          ) : sitters.length === 0 ? (
            <p className="text-stone-400 text-sm">No sitters found near you.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {sitters.map((sitter) => (
                <div
                  key={sitter.id}
                  onClick={() => navigate(`/sitters/${sitter.id}`)}
                  className="bg-stone-50 border border-stone-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-base font-semibold text-stone-800">
                      {sitter.name}
                    </h2>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-400 text-sm">★</span>
                      <span className="text-sm font-medium text-stone-700">
                        {sitter.average_rating != null
                          ? sitter.average_rating.toFixed(1)
                          : "0"}
                      </span>
                      <span className="text-xs text-stone-400">
                        ({sitter.review_count})
                      </span>
                    </div>
                  </div>
                  <p className="text-stone-400 text-xs">
                    {sitter.location?.city || "Location not set"}
                  </p>
                  {sitter.distance_miles != null && (
                    <p className="text-amber-700 text-xs mt-1">
                      {sitter.distance_miles.toFixed(1)} miles away
                    </p>
                  )}
                  {sitter.bio && (
                    <p className="text-stone-500 text-sm mt-2 line-clamp-2">
                      {sitter.bio}
                    </p>
                  )}
                  {sitter.sitter_profile?.nightly_rate ? (
                    <p className="mt-2 text-amber-700 text-sm font-medium">
                      ${(sitter.sitter_profile.nightly_rate / 100).toFixed(0)} /
                      night
                    </p>
                  ) : (
                    <p className="mt-2 text-stone-300 text-sm">Rate not set</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
