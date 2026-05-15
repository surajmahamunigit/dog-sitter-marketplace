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
                setDogs(dogs.filter(dog => dog.id !== id));
        } catch {
            setError("Failed to delete dog. Please try again.");
        }
    };

    if (loading) return <p className="p-8">Loading...</p>;
    if (error) return <p className="p-8 text-red-500">{error}</p>;

    return (
        <div className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">My Dogs</h1>
            <button
            onClick={() => navigate("/dogs/new")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
            + Add Dog
            </button>
        </div>

        {dogs.length === 0 ? (
            <p className="text-gray-500">No dogs yet. Add your first dog to get started.</p>
        ) : (
            <ul className="space-y-4">
            {dogs.map((dog) => (
                <li key={dog.id} className="border rounded p-4 flex justify-between items-center">
                <div>
                    <p className="font-semibold">{dog.name}</p>
                    <p className="text-sm text-gray-500">{dog.breed} · {dog.age} yrs · {dog.weight} lbs</p>
                </div>
                <button
                    onClick={() => handleDelete(dog.id)}
                    className="text-red-500 text-sm hover:underline"
                >
                    Delete
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
    );
}