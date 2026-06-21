import { useState, useEffect } from 'react'
import PredictBox from './PredictBox'
import MetricsPanel from './MetricsPanel'

export default function ModelPage({ model }) {
  const [metrics, setMetrics] = useState(null)
  const [loadingMetrics, setLoadingMetrics] = useState(true)

  useEffect(() => {
    setMetrics(null)
    setLoadingMetrics(true)

    fetch(`${import.meta.env.VITE_API_URL}/api/metrics/${model.id}`)
      .then(r => r.json())
      .then(d => {
        setMetrics(d)
        setLoadingMetrics(false)
      })
      .catch(() => setLoadingMetrics(false))
  }, [model.id])

  return (
    <div className="max-w-205 mx-auto px-8 pt-10 pb-20">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2.5">
          <span
            className="text-[11px] font-medium tracking-widest uppercase px-2.5 py-0.75 rounded font-mono"
            style={{
              background: model.colorDim,
              color: model.color,
            }}
          >
            {model.badge}
          </span>

          <span className="text-[11px] text-(--muted) font-mono">
            {model.group}
          </span>

          {model.simulated && (
            <span
              className="text-[10px] px-2 py-0.5 rounded font-mono border"
              style={{
                background: '#2a2410',
                color: '#fbbf24',
                borderColor: '#3d3010',
              }}
            >
              ⚡ demo mode
            </span>
          )}
        </div>

        <h2 className="m-0 mb-1.5 text-[28px] leading-[1.2] text-(--text)">
          {model.name}
        </h2>

        <div
          className="text-[13px] font-mono mb-3.5"
          style={{ color: model.color }}
        >
          {model.short}
        </div>

        <p className="m-0 text-[14px] leading-[1.8] text-[#a0a0b8] max-w-150">
          {model.description}
        </p>
      </div>

      {/* Pipeline */}
      <div className="mb-8">
        <div className="text-[11px] text-(--muted) tracking-widest uppercase mb-3">
          Processing Pipeline
        </div>

        <div className="flex items-center flex-wrap gap-1">
          {model.pipeline.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              <div
                className="px-3 py-1.25 rounded-[20px] text-[12px] whitespace-nowrap font-mono"
                style={{
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {step}
              </div>

              {i < model.pipeline.length - 1 && (
                <span className="text-[12px] text-(--muted)">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="h-px mb-8"
        style={{ background: 'var(--border)' }}
      />

      {/* Predict */}
      <PredictBox model={model} />

      <div
        className="h-px my-9"
        style={{ background: 'var(--border)' }}
      />

      {/* Metrics */}
      <MetricsPanel
        metrics={metrics}
        loading={loadingMetrics}
        color={model.color}
        colorDim={model.colorDim}
      />
    </div>
  )
}