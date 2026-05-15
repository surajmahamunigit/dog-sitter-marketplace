export default function BookingConfirmed() {
    return (
        <div className="max-w-md mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-500 mb-6">
                Your payment was successful. Your sitter will be in touch soon.
            </p>
            <a href="/dashboard" className="text-black underline">
                Go to your dashboard
            </a>
        </div>
    );
}