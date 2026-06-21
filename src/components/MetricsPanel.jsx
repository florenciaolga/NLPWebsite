const CLASSES = ['Negative', 'Positive', 'macro avg', 'weighted avg']

function fmt(v) {
  if (v === undefined || v === null) return '—'
  if (typeof v === 'number') return (v * 100).toFixed(1) + '%'
  return v
}

function Bar({ value, color }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1 rounded-[2px] overflow-hidden min-w-[60px]"
        style={{ background: 'var(--surface2)' }}
      >
        <div
          className="h-full rounded-[2px]"
          style={{
            width: `${(value * 100).toFixed(1)}%`,
            background: color,
          }}
        />
      </div>

      <span className="text-[12px] font-mono text-[var(--text)] min-w-[44px] text-right">
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  )
}

export default function MetricsPanel({
  metrics,
  loading,
  color,
  colorDim,
}) {
  if (loading) {
    return (
      <div className="text-[13px] text-[var(--muted)]">
        Loading metrics…
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-[13px] text-[var(--muted)]">
        Could not load metrics.
      </div>
    )
  }

  return (
    <div>
      <div className="text-[11px] text-[var(--muted)] tracking-[0.1em] uppercase mb-5">
        Evaluation Metrics
      </div>

      {/* Big accuracy card */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          { label: 'Accuracy', value: metrics.accuracy },
          {
            label: 'Precision (weighted)',
            value: metrics.precision?.['weighted avg'],
          },
          {
            label: 'Recall (weighted)',
            value: metrics.recall?.['weighted avg'],
          },
          {
            label: 'F1 Score (weighted)',
            value: metrics.f1?.['weighted avg'],
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[10px] px-[18px] py-4"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
            }}
          >
            <div className="text-[11px] text-[var(--muted)] mb-2 leading-[1.4]">
              {label}
            </div>

            <div
              className="text-[26px]"
              style={{
                color,
                fontFamily: 'Fraunces, serif',
              }}
            >
              {value !== undefined
                ? (value * 100).toFixed(1)
                : '—'}

              <span className="text-[14px] text-[var(--muted)]">
                %
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Per-class table */}
      <div className="text-[11px] text-[var(--muted)] tracking-[0.08em] uppercase mb-3">
        Per-class breakdown
      </div>

      <div
        className="rounded-[10px] overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-[10px] text-[11px] uppercase tracking-[0.08em] font-mono"
          style={{
            gridTemplateColumns: '120px 1fr 1fr 1fr 80px',
            background: 'var(--surface2)',
            borderBottom: '1px solid var(--border)',
            color: 'var(--muted)',
          }}
        >
          <div>Class</div>
          <div>Precision</div>
          <div>Recall</div>
          <div>F1 Score</div>
          <div>Support</div>
        </div>

        {CLASSES.map((cls, i) => {
          const isDivider = cls === 'macro avg'

          return (
            <div
              key={cls}
              className="grid gap-4 px-5 py-[14px] text-[13px]"
              style={{
                gridTemplateColumns: '120px 1fr 1fr 1fr 80px',
                borderTop: isDivider
                  ? '1px solid var(--border)'
                  : i > 0
                  ? '1px solid var(--border)22'
                  : 'none',
              }}
            >
              <div
                className="font-mono text-[12px] font-medium"
                style={{
                  color:
                    cls === 'Positive'
                      ? '#3ecf8e'
                      : cls === 'Negative'
                      ? '#f87171'
                      : 'var(--muted)',
                }}
              >
                {cls}
              </div>

              <Bar
                value={metrics.precision?.[cls] ?? 0}
                color={color}
              />

              <Bar
                value={metrics.recall?.[cls] ?? 0}
                color={color}
              />

              <Bar
                value={metrics.f1?.[cls] ?? 0}
                color={color}
              />

              <div className="text-[12px] text-[var(--muted)] font-mono pt-[2px]">
                {metrics.support?.[cls] ?? '—'}
              </div>
            </div>
          )
        })}
      </div>

      
    </div>
  )
}