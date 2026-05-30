import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateMe } from "../api/users";
import apiClient from "../api/client";
import type { User } from "../types";

const SERVICES_OPTIONS = [
  "boarding",
  "house_sitting",
  "drop_in_visits",
  "day_care",
  "walking",
];

export default function EditSitterProfile() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [experienceYears, setExperienceYears] = useState("0");
  const [nightlyRate, setNightlyRate] = useState("0");
  const [services, setServices] = useState<string[]>([
    "boarding",
    "house_sitting",
    "drop_in_visits",
    "day_care",
    "walking",
  ]);
  const [acceptedSizes, setAcceptedSizes] = useState<string[]>([
    "small",
    "medium",
    "large",
  ]);
  const [acceptsPuppies, setAcceptsPuppies] = useState(true);
  const [acceptsSeniorDogs, setAcceptsSeniorDogs] = useState(true);
  const [acceptsSpecialNeeds, setAcceptsSpecialNeeds] = useState(true);
  const [hasYard, setHasYard] = useState(true);
  const [hasOtherPets, setHasOtherPets] = useState(false);
  const [smokeFreHome, setSmokeFreeHome] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await apiClient.get<User>("/users/me");
        const u = response.data;

        if (u.bio) setBio(u.bio);
        if (u.location?.city) setCity(u.location.city);
        if (u.location?.lat) setLat(u.location.lat);
        if (u.location?.lng) setLng(u.location.lng);

        if (u.sitter_profile) {
          const p = u.sitter_profile;
          if (p.services) setServices(p.services);
          if (p.nightly_rate) setNightlyRate(String(p.nightly_rate / 100));
          if (p.experience_years)
            setExperienceYears(String(p.experience_years));
          if (p.accepted_dog_sizes) setAcceptedSizes(p.accepted_dog_sizes);
          setAcceptsPuppies(p.accepts_puppies ?? true);
          setAcceptsSeniorDogs(p.accepts_senior_dogs ?? true);
          setAcceptsSpecialNeeds(p.accepts_special_needs ?? true);
          setHasYard(p.has_yard ?? true);
          setHasOtherPets(p.has_other_pets ?? false);
          setSmokeFreeHome(p.smoke_free_home ?? true);
        }
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function toggleArrayValue(arr: string[], value: string): string[] {
    return arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
  }

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

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const updated = await updateMe({
        bio,
        location: {
          city,
          ...(lat !== null && lng !== null ? { lat, lng } : {}),
        },
        sitter_profile: {
          services,
          nightly_rate: Math.round(parseFloat(nightlyRate) * 100),
          experience_years: parseInt(experienceYears),
          accepted_dog_sizes: acceptedSizes,
          accepts_puppies: acceptsPuppies,
          accepts_senior_dogs: acceptsSeniorDogs,
          accepts_special_needs: acceptsSpecialNeeds,
          has_yard: hasYard,
          has_other_pets: hasOtherPets,
          smoke_free_home: smokeFreHome,
        },
      });
      setUser({ ...user!, ...updated });
      navigate("/dashboard");
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">
      {/* Back button */}
      <div className="w-full max-w-2xl mb-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          ← Back to dashboard
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-5">
          <h1 className="text-base font-semibold text-white">
            Edit Sitter Profile
          </h1>
          <p className="text-xs text-amber-100 mt-1">
            Update your services, rates, and preferences.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* About */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">About You</h2>
            <textarea
              className="w-full border border-stone-300 rounded-xl p-3 h-24 resize-none mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Tell owners about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="text"
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="City (e.g. Los Angeles)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
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
          </section>

          {/* Services */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">
              Services Offered
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {SERVICES_OPTIONS.map((option) => (
                <label
                  key={option}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={services.includes(option)}
                    onChange={() =>
                      setServices(toggleArrayValue(services, option))
                    }
                  />
                  <span className="capitalize">
                    {option.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* Rates */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">
              Rates & Experience
            </h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm text-stone-600 block mb-1">
                  Nightly rate ($)
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={nightlyRate}
                  onChange={(e) => setNightlyRate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-stone-600 block mb-1">
                  Years of experience
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Dog size preferences */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">
              Accepted Dog Sizes
            </h2>
            <div className="flex gap-4">
              {["small", "medium", "large"].map((size) => (
                <label
                  key={size}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={acceptedSizes.includes(size)}
                    onChange={() =>
                      setAcceptedSizes(toggleArrayValue(acceptedSizes, size))
                    }
                  />
                  <span className="capitalize">{size}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Dog preferences */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">
              Dog Preferences
            </h2>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Accepts puppies",
                  value: acceptsPuppies,
                  setter: setAcceptsPuppies,
                },
                {
                  label: "Accepts senior dogs",
                  value: acceptsSeniorDogs,
                  setter: setAcceptsSeniorDogs,
                },
                {
                  label: "Accepts special needs dogs",
                  value: acceptsSpecialNeeds,
                  setter: setAcceptsSpecialNeeds,
                },
              ].map(({ label, value, setter }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter(e.target.checked)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Home details */}
          <section>
            <h2 className="font-semibold text-amber-800 mb-2">Home Details</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Has a yard", value: hasYard, setter: setHasYard },
                {
                  label: "Has other pets",
                  value: hasOtherPets,
                  setter: setHasOtherPets,
                },
                {
                  label: "Smoke-free home",
                  value: smokeFreHome,
                  setter: setSmokeFreeHome,
                },
              ].map(({ label, value, setter }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setter(e.target.checked)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-2 rounded-full text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}
