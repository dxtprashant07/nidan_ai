export default function Header() {
  return (
    <header className="border-b border-white/5 bg-surface-800/60 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/30 flex items-center justify-center text-lg">
            🧠
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-gradient">NIDAN AI</span>
            <span className="ml-2 text-xs text-gray-500 hidden sm:inline">Medical Segmentation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow inline-block" />
          API Online
        </div>
      </div>
    </header>
  )
}
