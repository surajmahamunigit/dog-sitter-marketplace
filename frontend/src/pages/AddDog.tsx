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
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">
      {/* Back button */}
      <div className="w-full max-w-md mb-3">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
        >
          ← Back to dashboard
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-amber-600 px-6 py-5">
          <h1 className="text-base font-semibold text-white">Add a Dog</h1>
          <p className="text-xs text-amber-100 mt-1">
            Fill in your dog's basic details.
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Buddy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Breed
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Golden Retriever"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Age (years)
            </label>
            <input
              type="number"
              min="0"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="65"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 rounded-full text-sm font-medium disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Adding..." : "Add Dog"}
          </button>
        </div>
      </div>
    </div>
  );
}
