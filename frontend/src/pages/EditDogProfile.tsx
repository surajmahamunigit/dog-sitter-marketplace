import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getDogById } from "../api/dogs"
import { updateDog } from "../api/dogs"

const TEMPERAMENT_OPTIONS = [
    "friendly",
    "playful",
    "anxious_with_strangers",
    "aggressive_with_dogs",
    "shy",
    "calm",
    "protective",
]

const SPECIAL_NEEDS_OPTIONS = [
    "separation_anxiety",
    "daily_medication",
    "mobility_issues",
    "dietary_restrictions",
    "reactive_on_leash",
]

export default function EditDogProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    // Form state — mirrors dog_profile JSONB shape
    const [size, setSize] = useState("medium")
    const [energyLevel, setEnergyLevel] = useState("medium")
    const [temperament, setTemperament] = useState<string[]>([])
    const [goodWithDogs, setGoodWithDogs] = useState(true)
    const [goodWithCats, setGoodWithCats] = useState(true)
    const [goodWithChildren, setGoodWithChildren] = useState(true)
    const [houseTrained, setHouseTrained] = useState(true)
    const [specialNeeds, setSpecialNeeds] = useState<string[]>([])
    const [medicalNotes, setMedicalNotes] = useState("")
    const [vaccinationStatus, setVaccinationStatus] = useState("up_to_date")

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dogName, setDogName] = useState("")

    // On mount: fetch existing dog data and pre-populate form
    useEffect(() => {
        async function fetchDog() {
        try {
            const dog = await getDogById(id!)
            setDogName(dog.name)

            // Pre-populate from existing dog_profile if it exists
            if (dog.dog_profile) {
            const p = dog.dog_profile
            if (p.size) setSize(p.size)
            if (p.energy_level) setEnergyLevel(p.energy_level)
            if (p.temperament) setTemperament(p.temperament)
            if (p.good_with_other_dogs !== undefined) setGoodWithDogs(p.good_with_other_dogs)
            if (p.good_with_cats !== undefined) setGoodWithCats(p.good_with_cats)
            if (p.good_with_children !== undefined) setGoodWithChildren(p.good_with_children)
            if (p.house_trained !== undefined) setHouseTrained(p.house_trained)
            if (p.special_needs) setSpecialNeeds(p.special_needs)
            if (p.medical_notes) setMedicalNotes(p.medical_notes)
            if (p.vaccination_status) setVaccinationStatus(p.vaccination_status)
            }
        } catch {
            setError("Failed to load dog profile.")
        } finally {
            setLoading(false)
        }
        }
        fetchDog()
    }, [id])

    // Toggle a value in/out of an array (used for temperament + special_needs)
    function toggleArrayValue(arr: string[], value: string): string[] {
        return arr.includes(value)
        ? arr.filter((v) => v !== value)
        : [...arr, value]
    }

    async function handleSubmit() {
        setSubmitting(true)
        try {
        await updateDog(id!, {
            dog_profile: {
            size,
            energy_level: energyLevel,
            temperament,
            good_with_other_dogs: goodWithDogs,
            good_with_cats: goodWithCats,
            good_with_children: goodWithChildren,
            house_trained: houseTrained,
            special_needs: specialNeeds,
            medical_notes: medicalNotes,
            vaccination_status: vaccinationStatus,
            },
        })
        navigate("/dashboard")
        } catch {
        setError("Failed to save profile. Please try again.")
        } finally {
        setSubmitting(false)
        }
    }

    if (loading) return <p className="p-8">Loading...</p>
    if (error) return <p className="p-8 text-red-600">{error}</p>

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Profile — {dogName}</h1>

        {/* Size */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Size</h2>
            <div className="flex gap-4">
            {["small", "medium", "large"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    name="size"
                    value={option}
                    checked={size === option}
                    onChange={(e) => setSize(e.target.value)}
                />
                <span className="capitalize">{option}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Energy level */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Energy Level</h2>
            <div className="flex gap-4">
            {["low", "medium", "high"].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    name="energy_level"
                    value={option}
                    checked={energyLevel === option}
                    onChange={(e) => setEnergyLevel(e.target.value)}
                />
                <span className="capitalize">{option}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Temperament */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Temperament (select all that apply)</h2>
            <div className="grid grid-cols-2 gap-2">
            {TEMPERAMENT_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={temperament.includes(option)}
                    onChange={() => setTemperament(toggleArrayValue(temperament, option))}
                />
                <span className="capitalize">{option.replace(/_/g, " ")}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Boolean fields */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Compatibility</h2>
            <div className="flex flex-col gap-2">
            {[
                { label: "Good with other dogs", value: goodWithDogs, setter: setGoodWithDogs },
                { label: "Good with cats", value: goodWithCats, setter: setGoodWithCats },
                { label: "Good with children", value: goodWithChildren, setter: setGoodWithChildren },
                { label: "House trained", value: houseTrained, setter: setHouseTrained },
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

        {/* Special needs */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Special Needs (select all that apply)</h2>
            <div className="grid grid-cols-2 gap-2">
            {SPECIAL_NEEDS_OPTIONS.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={specialNeeds.includes(option)}
                    onChange={() => setSpecialNeeds(toggleArrayValue(specialNeeds, option))}
                />
                <span className="capitalize">{option.replace(/_/g, " ")}</span>
                </label>
            ))}
            </div>
        </section>

        {/* Medical notes */}
        <section className="mb-6">
            <h2 className="font-semibold mb-2">Medical Notes</h2>
            <textarea
            className="w-full border rounded p-2 h-24 resize-none"
            placeholder="e.g. Takes Apoquel daily for allergies"
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            />
        </section>

        {/* Vaccination status */}
        <section className="mb-8">
            <h2 className="font-semibold mb-2">Vaccination Status</h2>
            <div className="flex gap-4">
            {[
                { value: "up_to_date", label: "Up to date" },
                { value: "partial", label: "Partial" },
                { value: "unknown", label: "Unknown" },
            ].map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                    type="radio"
                    name="vaccination_status"
                    value={option.value}
                    checked={vaccinationStatus === option.value}
                    onChange={(e) => setVaccinationStatus(e.target.value)}
                />
                <span>{option.label}</span>
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