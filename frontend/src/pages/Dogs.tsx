import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyDogs, deleteDog } from "../api/dogs";
import type { Dog } from "../types";

export default function Dogs() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyDogs()
      .then(setDogs)
      .catch(() => setError("Couldn't load your dogs."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDog(id);
      setDogs(dogs.filter((dog) => dog.id !== id));
    } catch {
      setError("Failed to delete dog. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-xs px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            ← Back to dashboard
          </button>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-stone-900">My Dogs</h1>
          <button
            onClick={() => navigate("/dogs/new")}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-1.5 rounded-full cursor-pointer transition-colors"
          >
            + Add Dog
          </button>
        </div>

        {/* Empty state */}
        {dogs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <div className="text-4xl mb-3">🐶</div>
            <p className="text-stone-500 text-sm">
              No dogs yet. Add your first dog to get started.
            </p>
            <button
              onClick={() => navigate("/dogs/new")}
              className="mt-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-full cursor-pointer transition-colors"
            >
              + Add Dog
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {dogs.map((dog) => (
              <li
                key={dog.id}
                className="bg-white border border-stone-200 rounded-2xl px-5 py-4 shadow-sm flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-xl flex-shrink-0">
                    🐶
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {dog.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {dog.breed} · {dog.age} yrs · {dog.weight} lbs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(dog.id)}
                  className="text-red-400 hover:text-red-600 text-xs font-medium cursor-pointer"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
