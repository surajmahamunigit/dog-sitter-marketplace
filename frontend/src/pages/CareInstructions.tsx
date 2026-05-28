import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMyDogs } from "../api/dogs"
import { getCareInstructions, saveCareInstructions } from "../api/careInstructions"

export default function CareInstructions() {
    const { dogId } = useParams<{ dogId: string }>()
    const navigate = useNavigate()

    const [dogName, setDogName] = useState<string>("")
    const [content, setContent] = useState("")
    const [embeddingStatus, setEmbeddingStatus] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                const dogs = await getMyDogs()
                const dog = dogs.find((d) => d.id === dogId)
                if (dog) setDogName(dog.name)

                const instructions = await getCareInstructions(dogId!)
                if (instructions) {
                    setContent(instructions.content)
                    setEmbeddingStatus(instructions.embedding_status)
                }
            } catch {
                setError("Could not load care instructions.")
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [dogId])

    async function handleSave() {
        if (!content.trim()) return
        setSaving(true)
        try {
            await saveCareInstructions(dogId!, content)
            setEmbeddingStatus("completed")
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } catch {
            setError("Failed to save care instructions.")
        } finally {
            setSaving(false)
        }
    }

    function statusLabel() {
        if (embeddingStatus === "completed") return `${dogName}'s AI profile is up to date`
        if (embeddingStatus === "pending") return "Processing..."
        return "Not set up yet"
    }

    function statusColor() {
        if (embeddingStatus === "completed") return "text-emerald-400"
        if (embeddingStatus === "pending") return "text-yellow-400"
        return "text-zinc-500"
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <p className="text-zinc-400">Loading...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">

            {/* Back button */}
            <div className="w-full max-w-2xl mb-3">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 text-stone-600 text-sm px-4 py-2 rounded-full cursor-pointer transition-colors"
                >
                    ← Back to dashboard
                </button>
            </div>

            {/* Card */}
            <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-xl">

                {/* Header */}
                <div className="bg-stone-900 border-b border-stone-700 px-6 py-5">
                    <h1 className="text-base font-semibold text-stone-100">
                        Care Instructions for {dogName}
                    </h1>
                    <p className="text-xs text-stone-500 mt-1">
                        Help your sitter take care of {dogName} while you're away.
                    </p>
                </div>

                {/* Body */}
                <div className="bg-stone-800 px-6 py-6 flex flex-col gap-5">

                    {/* Textarea */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`Describe ${dogName}'s routine, feeding schedule, medications, personality, and anything else your sitter needs to know...`}
                        rows={10}
                        className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none leading-relaxed"
                    />

                    {/* Save button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleSave}
                            disabled={saving || !content.trim()}
                            className="inline-flex items-center bg-amber-700 hover:bg-amber-600 text-amber-50 text-sm font-medium px-6 py-2 rounded-full disabled:opacity-50 cursor-pointer transition-colors"
                        >
                            {saving ? "Saving..." : "Save Instructions"}
                        </button>

                        
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-2 text-xs ${statusColor()}`}>
                        {embeddingStatus === "completed" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                        )}
                        {statusLabel()}
                    </div>

                    
                </div>
            </div>
            {/* Toast */}
                    {showToast && (
                        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-emerald-400 text-sm px-6 py-3 rounded-full shadow-lg border border-stone-700 transition-all">
                            Care instructions saved and added to {dogName}'s AI profile
                        </div>
                    )}
        </div>
    )
}