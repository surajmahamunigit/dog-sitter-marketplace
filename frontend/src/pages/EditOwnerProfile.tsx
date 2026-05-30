import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMe } from "../api/users";

export default function EditOwnerProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? "");
    setEmail(user.email ?? "");
    if (user.location?.city) setCity(user.location.city);
    if (user.location?.lat) setLat(user.location.lat);
    if (user.location?.lng) setLng(user.location.lng);
  }, [user]);

  function handleUseMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setLocating(false);
      },
      () => {
        setError("Could not get your location.");
        setLocating(false);
      },
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const updated = await updateMe({
        name,
        email,
        location: {
          city,
          ...(lat !== null && lng !== null ? { lat, lng } : {}),
        },
      });
      setUser({ ...user!, ...updated });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">
      {/* Back button */}
      <div className="w-full max-w-lg mb-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          ← Back to dashboard
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-5">
          <h1 className="text-base font-semibold text-white">Edit Profile</h1>
          <p className="text-xs text-amber-100 mt-1">
            Update your personal information.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Los Angeles"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-2"
            />
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={locating}
              className="text-sm text-amber-700 border border-amber-300 px-3 py-1.5 rounded-full hover:bg-amber-50 disabled:opacity-50 cursor-pointer"
            >
              {locating ? "Locating..." : "Use My Location"}
            </button>
            {lat && lng && (
              <p className="text-xs text-stone-400 mt-1">
                Location set: {lat.toFixed(4)}, {lng.toFixed(4)}
              </p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Profile"}
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-stone-500 hover:text-stone-700 text-sm cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
