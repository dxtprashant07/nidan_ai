import { useState } from 'react'

const TABS = [
  { id: 'original', label: 'Original', emoji: '🩻' },
  { id: 'mask', label: 'Probability Map', emoji: '🌡' },
  { id: 'overlay', label: 'Segmentation', emoji: '🎯' },
]

function MetricCard({ label, value, unit = '', color = 'brand' }) {
  const colorMap = {
    brand: 'text-brand',
    emerald: 'text-emerald-400',
    violet: 'text-violet-400',
    amber: 'text-amber-400',
  }
  return (
    <div className="metric-card">
      <span className={`text-2xl font-bold font-mono ${colorMap[color]}`}>
        {value}
        {unit && <span className="text-sm ml-0.5 opacity-70">{unit}</span>}
      </span>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  )
}

export default function ResultsPanel({ result, error }) {
  const [tab, setTab] = useState('overlay')

  const imgSrc = result
    ? {
        original: `data:image/png;base64,${result.original_image}`,
        mask: `data:image/png;base64,${result.mask_image}`,
        overlay: `data:image/png;base64,${result.overlay_image}`,
      }
    : null

  return (
    <div className="card p-6 flex flex-col gap-5 min-h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-200">Results</h2>
        {result && (
          <span className="text-xs bg-brand/15 text-brand border border-brand/25 rounded-full px-3 py-1">
            {result.model_name}
          </span>
        )}
      </div>

      {/* Tab switcher */}
      {result && (
        <div className="flex gap-1 bg-surface-900 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-150
                ${tab === t.id
                  ? 'bg-brand/20 text-brand border border-brand/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Image display */}
      <div className="flex-1 flex items-center justify-center rounded-xl bg-surface-900 overflow-hidden min-h-[280px] relative">
        {error && (
          <div className="text-center px-8">
            <div className="text-3xl mb-3">⚠️</div>
            <p className="text-red-400 font-medium text-sm">{error}</p>
          </div>
        )}

        {!result && !error && (
          <div className="text-center text-gray-600">
            <div className="text-5xl mb-4 opacity-30">🔬</div>
            <p className="text-sm">Upload an image and run analysis to see results</p>
          </div>
        )}

        {result && imgSrc && (
          <img
            key={tab}
            src={imgSrc[tab]}
            alt={tab}
            className="max-w-full max-h-[340px] object-contain rounded-lg"
            style={{ imageRendering: 'pixelated' }}
          />
        )}
      </div>

      {/* Metrics */}
      {result && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-3">
            Analysis Metrics
          </p>
          <div className="grid grid-cols-3 gap-3">
            <MetricCard
              label="Coverage"
              value={result.metrics.coverage_percent}
              unit="%"
              color="brand"
            />
            <MetricCard
              label="Regions Detected"
              value={result.metrics.detected_regions}
              color="emerald"
            />
            <MetricCard
              label="Confidence"
              value={result.metrics.mean_confidence}
              unit="%"
              color="violet"
            />
          </div>
          <p className="text-xs text-gray-600 mt-3 text-right font-mono">
            {result.metrics.segmented_pixels.toLocaleString()} / 65,536 px segmented
          </p>
        </div>
      )}
    </div>
  )
}
