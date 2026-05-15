import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDog } from "../api/dogs";

export default function AddDog() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [breed, setBreed] = useState("");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!name || !breed || !age || !weight) {
        setError("All fields are required.");
        return;
        }

        if (parseInt(age) <= 0 || parseInt(weight) <= 0) {
            setError("Age and weight must be greater than 0.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
        await createDog({
            name,
            breed,
            age: parseInt(age),
            weight: parseInt(weight),
        });
        navigate("/dogs");
        } catch {
        setError("Failed to add dog. Please try again.");
        } finally {
        setSubmitting(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Add a Dog</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
            <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Buddy"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Breed</label>
            <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Golden Retriever"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Age (years)</label>
            <input
                type="number"
                min="0"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="3"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
            <input
                type="number"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="65"
            />
            </div>

            <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-50"
            >
            {submitting ? "Adding..." : "Add Dog"}
            </button>
        </div>
        </div>
    );
}