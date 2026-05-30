import { useNavigate } from "react-router-dom";

export default function BookingCancelled() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 max-w-md w-full text-center">
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4 text-2xl">
          🐾
        </div>

        <h1 className="text-xl font-semibold text-stone-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-sm text-stone-400 mb-6">
          No payment was taken. You can try again any time.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-medium px-5 py-2 rounded-full cursor-pointer transition-colors"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate("/sitters")}
            className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-5 py-2 rounded-full cursor-pointer transition-colors"
          >
            Browse Sitters
          </button>
        </div>
      </div>
    </div>
  );
}
