export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 mx-auto">
            <svg viewBox="0 0 80 80" fill="none" className="w-full h-full animate-leaf">
              <circle cx="40" cy="40" r="38" fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth="1.5"/>
              <text x="40" y="52" textAnchor="middle" fontSize="32" fill="#4ade80">🌾</text>
            </svg>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
            <span className="typing-dot"/>
            <span className="typing-dot"/>
            <span className="typing-dot"/>
          </div>
        </div>
        <h2 className="text-2xl font-display font-bold text-white mb-1">AGRIFATHER</h2>
        <p className="text-forest-300 text-sm font-devanagari">अग्रीफादर लोड हो रहा है...</p>
      </div>
    </div>
  );
}
