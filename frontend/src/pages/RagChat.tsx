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
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
                <p className="text-red-500">{fetchError}</p>
            </div>
        )
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
                <p className="text-zinc-400">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-100 flex flex-col items-center py-8 px-4">

            {/* Back button — dark pill */}
            <div className="w-full max-w-2xl mb-3">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-600 text-sm px-4 py-2 rounded-full cursor-pointer transition-colors"
                >
                    ← Back to dashboard
                </button>
            </div>

            {/* Chat card */}
            <div className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden shadow-xl">

                {/* Header */}
                <div className="bg-zinc-900 border-b border-zinc-700 px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-900 flex items-center justify-center text-lg flex-shrink-0">
                        🐾
                    </div>
                    <div>
                        <h1 className="font-semibold text-zinc-100 text-base">
                            Ask about {booking.dog_name}
                        </h1>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                            Grounded in owner's care instructions
                        </p>
                    </div>
                </div>

                {/* Message history */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-96 bg-zinc-800">
                    {messages.length === 0 && (
                        <p className="text-center text-zinc-500 text-sm mt-10">
                            Ask anything about {booking.dog_name}'s care routine.
                        </p>
                    )}

                    {messages.map((msg, i) => (
                        <div
                            key={i}
                            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                            {msg.role === "assistant" && (
                                <div className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                    🐶
                                </div>
                            )}
                            <div className="max-w-[75%]">
                                <div
                                    className={`px-4 py-2.5 text-sm leading-relaxed ${
                                        msg.role === "user"
                                            ? "bg-emerald-700 text-emerald-50 rounded-2xl rounded-br-sm"
                                            : "bg-zinc-700 border border-zinc-600 text-zinc-100 rounded-2xl rounded-bl-sm"
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
                                    <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                        🛡 Based on owner's care instructions
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-full bg-emerald-900 flex items-center justify-center text-sm flex-shrink-0 mt-1">
                                🐶
                            </div>
                            <div className="bg-zinc-700 border border-zinc-600 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input bar */}
                <div className="bg-zinc-900 border-t border-zinc-700 px-4 py-3 flex gap-3 items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder={`Ask about ${booking.dog_name}...`}
                        disabled={loading}
                        className="flex-1 bg-zinc-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-100 placeholder-zinc-500 border border-zinc-700"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-emerald-50 disabled:opacity-40 cursor-pointer hover:bg-emerald-600 flex-shrink-0"
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    )
}