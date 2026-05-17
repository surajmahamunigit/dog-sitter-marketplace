import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { updateMe } from "../api/users"
import apiClient from "../api/client"
import type { User } from "../types"

const SERVICES_OPTIONS = [
    "boarding",
    "house_sitting",
    "drop_in_visits",
    "day_care",
    "walking",
]

export default function EditSitterProfile() {
    const { user, setUser } = useAuth()
    const navigate = useNavigate()

    // Form state
    const [bio, setBio] = useState("")
    const [city, setCity] = useState("")
    const [experienceYears, setExperienceYears] = useState("0")
    const [nightlyRate, setNightlyRate] = useState("0")
    const [services, setServices] = useState<string[]>([])
    const [acceptedSizes, setAcceptedSizes] = useState<string[]>([])
    const [acceptsPuppies, setAcceptsPuppies] = useState(false)
    const [acceptsSeniorDogs, setAcceptsSeniorDogs] = useState(false)
    const [acceptsSpecialNeeds, setAcceptsSpecialNeeds] = useState(false)
    const [hasYard, setHasYard] = useState(false)
    const [hasOtherPets, setHasOtherPets] = useState(false)
    const [smokeFreHome, setSmokeFreeHome] = useState(false)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // On mount: fetch current user profile and pre-populate form
    useEffect(() => {
        async function fetchProfile() {
        try {
            const response = await apiClient.get<User>("/users/me")
            const u = response.data

            if (u.bio) setBio(u.bio)
            if (u.location?.city) setCity(u.location.city)

            if (u.sitter_profile) {
            const p = u.sitter_profile
            if (p.services) setServices(p.services)
            if (p.nightly_rate) setNightlyRate(String(p.nightly_rate / 100))
            if (p.experience_years) setExperienceYears(String(p.experience_years))
            if (p.accepted_dog_sizes) setAcceptedSizes(p.accepted_dog_sizes)
            setAcceptsPuppies(p.accepts_puppies ?? false)
            setAcceptsSeniorDogs(p.accepts_senior_dogs ?? false)
            setAcceptsSpecialNeeds(p.accepts_special_needs ?? false)
            setHasYard(p.has_yard ?? false)
            setHasOtherPets(p.has_other_pets ?? false)
            setSmokeFreeHome(p.smoke_free_home ?? false)
            }
        } catch {
            setError("Failed to load profile.")
        } finally {
            setLoading(false)
        }
        }
        fetchProfile()
    }, [])

    function toggleArrayValue(arr: string[], value: string): string[] {
        return arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value]
    }

    async function handleSubmit() {
        setSubmitting(true)
        try {
        const updated = await updateMe({
            bio,
            location: { city },
            sitter_profile: {
            services,
            nightly_rate: Math.round(parseFloat(nightlyRate) * 100), // dollars → cents
            experience_years: parseInt(experienceYears),
            accepted_dog_sizes: acceptedSizes,
            accepts_puppies: acceptsPuppies,
            accepts_senior_dogs: acceptsSeniorDogs,
            accepts_special_needs: acceptsSpecialNeeds,
            has_yard: hasYard,
            has_other_pets: hasOtherPets,
            smoke_free_home: smokeFreHome,
            },
        })
        // Update AuthContext so navbar + dashboard reflect new data
        setUser({ ...user!, ...updated })
        navigate("/dashboard")
        } catch {
        setError("Failed to save profile. Please try again.")
        } finally {
        setSubmitting(false)
        }
    }

    if (loading) return <p className="p-8">Loading...</p>
    if (error && !submitting) return <p className="p-8 text-red-600">{error}</p>

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Sitter Profile</h1>

        {/* About */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">About You</h2>
            <textarea
                className="w-full border rounded p-2 h-24 resize-none mb-3"
                placeholder="Tell owners about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
            />
            <input
                type="text"
                className="w-full border rounded p-2"
                placeholder="City (e.g. Los Angeles)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
            />
        </section>

        {/* Services */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Services Offered</h2>
            <div className="grid grid-cols-2 gap-2">
            {SERVICES_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={services.includes(option)}
                    onChange={() => setServices(toggleArrayValue(services, option))}
                />
                <span className="capitalize">{option.replace(/_/g, " ")}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Rates */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Rates & Experience</h2>
            <div className="flex gap-4">
            <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Nightly rate ($)</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded p-2"
                    value={nightlyRate}
                    onChange={(e) => setNightlyRate(e.target.value)}
                />
            </div>
            <div className="flex-1">
                <label className="text-sm text-gray-600 block mb-1">Years of experience</label>
                <input
                    type="number"
                    min="0"
                    className="w-full border rounded p-2"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                />
            </div>
            </div>
        </section>

        {/* Dog size preferences */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Accepted Dog Sizes</h2>
            <div className="flex gap-4">
            {["small", "medium", "large"].map((size) => (
                <label key={size} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={acceptedSizes.includes(size)}
                    onChange={() => setAcceptedSizes(toggleArrayValue(acceptedSizes, size))}
                />
                <span className="capitalize">{size}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Dog preferences */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Dog Preferences</h2>
            <div className="flex flex-col gap-2">
            {[
                { label: "Accepts puppies", value: acceptsPuppies, setter: setAcceptsPuppies },
                { label: "Accepts senior dogs", value: acceptsSeniorDogs, setter: setAcceptsSeniorDogs },
                { label: "Accepts special needs dogs", value: acceptsSpecialNeeds, setter: setAcceptsSpecialNeeds },
            ].map(({ label, value, setter }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
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
        <section className="mb-8">
            <h2 className="font-semibold mb-2">Home Details</h2>
            <div className="flex flex-col gap-2">
            {[
                { label: "Has a yard", value: hasYard, setter: setHasYard },
                { label: "Has other pets", value: hasOtherPets, setter: setHasOtherPets },
                { label: "Smoke-free home", value: smokeFreHome, setter: setSmokeFreeHome },
            ].map(({ label, value, setter }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer">
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

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 disabled:opacity-50"
        >
            {submitting ? "Saving..." : "Save Profile"}
        </button>
        </div>
    )
}