import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getMyBookings } from "../api/bookings"
import { askRag } from "../api/rag"

interface Message {
    role: "user" | "assistant"
    content: string
}

interface Booking {
    id: string
    owner_id: string
    sitter_id: string
    dog_id: string
    dog_name: string
    status: string
    start_date: string
    end_date: string
    total_price: number
}

export default function RagChat() {
    const { bookingId } = useParams<{ bookingId: string }>()
    const navigate = useNavigate()

    const [booking, setBooking] = useState<Booking | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    useEffect(() => {
        async function loadBooking() {
            try {
                const all = await getMyBookings()
                const found = all.find((b) => b.id === bookingId)
                if (!found) {
                    setFetchError("Booking not found.")
                    return
                }
                setBooking(found)
            } catch {
                setFetchError("Could not load booking details.")
            }
        }
        loadBooking()
    }, [bookingId])

    async function handleSend() {
        if (!input.trim() || !booking || loading) return

        const question = input.trim()
        setMessages((prev) => [...prev, { role: "user", content: question }])
        setInput("")
        setLoading(true)

        try {
            const { answer } = await askRag(booking.dog_id, question)
            setMessages((prev) => [...prev, { role: "assistant", content: answer }])
        } catch (err: any) {
            const errorMsg =
                err.response?.status === 400
                    ? "Owner hasn't set up care instructions for this dog yet."
                    : err.response?.data?.detail ?? "Something went wrong."
            setMessages((prev) => [...prev, { role: "assistant", content: errorMsg }])
        } finally {
            setLoading(false)
        }
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <p className="text-red-500">{fetchError}</p>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center">
                <p className="text-stone-400">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 px-4">

            {/* Back button */}
            <div className="w-full max-w-2xl mb-3">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 bg-stone-200 hover:bg-stone-300 border border-stone-300 text-stone-700 text-sm px-4 py-2 rounded-full cursor-pointer transition-colors"
                >
                    ← Back to dashboard
                </button>
            </div>

            {/* Chat card */}
            <div className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-sm border border-stone-200">

                {/* Header */}
                <div className="bg-amber-600 px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-lg flex-shrink-0">
                        🐾
                    </div>
                    <div>
                        <h1 className="font-semibold text-white text-base">
                            Ask about {booking.dog_name}
                        </h1>
                        <p className="text-xs text-amber-100 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white inline-block"></span>
                            Grounded in owner's care instructions
                        </p>
                    </div>
                </div>

                {/* Message history */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-96 bg-stone-50">
                    {messages.length === 0 && (
                        <p className="text-center text-stone-400 text-sm mt-10">
                            Ask anything about {booking.dog_name}'s care routine.
                        </p>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                    🐶
                                </div>
                            )}
                            <div className="max-w-[75%]">
                                <div
                                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-amber-500 text-white rounded-2xl rounded-br-sm"
                                            : "bg-white border border-stone-200 text-stone-800 rounded-2xl rounded-bl-sm"
                                    }`}
                                >
                                    <p dangerouslySetInnerHTML={{
                                        __html: msg.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                            .replace(/\n/g, '<br/>')
                                    }} />
                                </div>
                                {msg.role === "assistant" && (
                                    <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                                        🛡 Based on owner's care instructions
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                🐶
                            </div>
                            <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:0ms]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:150ms]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce [animation-delay:300ms]"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div className="bg-white border-t border-stone-200 px-4 py-3 flex gap-3 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={`Ask about ${booking.dog_name}...`}
                        disabled={loading}
                        className="flex-1 bg-stone-50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-800 placeholder-stone-400 border border-stone-200"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white disabled:opacity-40 cursor-pointer hover:bg-amber-600 flex-shrink-0"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}