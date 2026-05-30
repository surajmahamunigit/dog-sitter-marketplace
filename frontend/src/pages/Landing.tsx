import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <div className="max-w-2xl mx-auto text-center px-8 pt-20 pb-14">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5 text-xs font-semibold text-amber-700 mb-8">
          ✦ AI-powered pet care
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-bold text-stone-900 leading-tight mb-4"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Pet Care
          <br />
          <span className="text-amber-600">Reimagined</span>
        </h1>

        {/* Subtext */}
        <p className="text-base text-stone-500 leading-relaxed mb-8 max-w-lg mx-auto">
          Find trusted sitters, manage personalized care instructions, and
          provide AI-guided support for every stay.
        </p>

        {/* CTAs */}
        <div className="flex gap-3 justify-center">
          <Link
            to="/register"
            className="text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            style={{ background: "linear-gradient(135deg, #b45309, #d97706)" }}
          >
            Find a Sitter →
          </Link>
          <Link
            to="/register?role=sitter"
            className="bg-orange-100 text-orange-700 border border-orange-300 text-sm font-medium px-6 py-2.5 rounded-full hover:bg-orange-200 transition-colors"
          >
            Become a Sitter
          </Link>
        </div>
      </div>

      {/* Feature cards */}
      <div className="max-w-3xl mx-auto px-8 grid grid-cols-2 gap-5 pb-20">
        {[
          {
            icon: "🐾",
            bg: "bg-amber-50",
            title: "AI-matched sitters",
            desc: "Match with caregivers based on breed, energy level, routines, and care requirements.",
          },
          {
            icon: "💬",
            bg: "bg-emerald-50",
            title: "AI care assistant",
            desc: "Sitters can ask questions and receive instant answers based on your pet's care profile.",
          },
          {
            icon: "⭐",
            bg: "bg-amber-50",
            title: "Verified reviews",
            desc: "Review real owner feedback with AI-generated insights and trust signals.",
          },
          {
            icon: "💳",
            bg: "bg-blue-50",
            title: "Secure payments",
            desc: "Protected Stripe checkout with booking management and refund support.",
          },
        ].map((card) => (
          <div
            key={card.title}
            className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm"
          >
            <div
              className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center text-xl mb-4`}
            >
              {card.icon}
            </div>
            <h3 className="text-sm font-bold text-stone-900 mb-2">
              {card.title}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-xs text-stone-400">
        © 2026 PawSitter. All rights reserved.
      </div>
    </div>
  );
}
