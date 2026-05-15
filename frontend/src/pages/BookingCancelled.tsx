export default function BookingCancelled() {
    return (
        <div className="max-w-md mx-auto p-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
            <p className="text-gray-500 mb-6">
                No payment was taken. You can try again any time.
            </p>
            <a href="/sitters" className="text-black underline">
                Browse sitters
            </a>
        </div>
    );
}