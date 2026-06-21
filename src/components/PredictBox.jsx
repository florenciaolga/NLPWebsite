import { useState } from 'react'

const EXAMPLES = [
  'Produk sangat bagus, kualitas terjaga, pengiriman cepat! Puas banget belanja di sini.',
  'Kecewa banget, barang tidak sesuai deskripsi, warna berbeda dari foto. Tidak recommended.',
  'Seller responsif, packing rapi, barang sampai dalam kondisi sempurna. Mantap!',
  'Sudah komplain tapi tidak ada respon dari seller. Barang rusak waktu diterima.',
]

export default function PredictBox({ model }) {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function predict() {
    if (!text.trim()) return

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const r = await fetch(`${import.meta.env.VITE_API_URL}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model: model.id,
        }),
      })

      const d = await r.json()

      if (d.error) {
        setError(d.error)
        setLoading(false)
        return
      }

      setResult(d)
    } catch (e) {
      setError('Backend error, please check railway')
    }

    setLoading(false)
  }

  const isPos = result?.label === 'Positive'
  const resultColor = isPos ? '#3ecf8e' : '#f87171'
  const resultBg = isPos ? '#1a3d2b' : '#3d1f1f'

  return (
    <div>
      <div className="text-[11px] text---muted) tracking-widest uppercase mb-3">
        Try it out
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => setText(ex)}
            className="px-2.5 py-1 rounded-[20px] text-[11px] cursor-pointer font-mono transition-colors"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--muted)'
            }}
          >
            Example {i + 1}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Masukkan ulasan produk dalam Bahasa Indonesia..."
        onKeyDown={e => {
          if (e.key === 'Enter' && e.ctrlKey) predict()
        }}
        className="w-full min-h-25 rounded-lg px-3.5py-3 text-[14px] resize-y outline-none transition-colors leading-[1.6]"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontFamily: 'DM Sans, sans-serif',
        }}
        onFocus={e => {
          e.target.style.borderColor = model.color
        }}
        onBlur={e => {
          e.target.style.borderColor = 'var(--border)'
        }}
      />

      <div className="flex items-center justify-between mt-2.5">
        

        <button
          onClick={predict}
          disabled={loading || !text.trim()}
          className="px-6 py-2.25 rounded-md text-[13px] font-medium transition-all flex items-center gap-2 border-none"
          style={{
            background: loading ? 'var(--surface2)' : model.color,
            color: loading ? 'var(--muted)' : '#0f0f10',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? (
            <>
              <Spinner color={model.color} />
              Predicting...
            </>
          ) : (
            'Predict Sentiment'
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mt-4 px-4 py-3 rounded-lg text-[13px] font-mono"
          style={{
            background: '#3d1f1f',
            border: '1px solid #6b2f2f',
            color: '#f87171',
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div
          className="mt-4 rounded-[10px] overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${resultColor}44`,
          }}
        >
          {/* Main result */}
          <div
            className="flex items-center gap-4 px-5 py-4.5"
            style={{
              background: resultBg,
              borderBottom: `1px solid ${resultColor}33`,
            }}
          >
            <div className="text-[36px]">
              {isPos ? '😊' : '😞'}
            </div>

            <div>
              <div
                className="text-[11px] uppercase tracking-widest mb-0.5"
                style={{
                  color: resultColor,
                  opacity: 0.8,
                }}
              >
                Sentiment
              </div>

              <div
                className="text-[24px] font-normal"
                style={{
                  color: resultColor,
                  fontFamily: 'Fraunces, serif',
                }}
              >
                {result.label}
              </div>
            </div>

            {/* Confidence bar */}
            <div className="flex-1">
              <div className="flex justify-between mb-1.5 text-[12px]">
                <span className="text-(--muted)">
                  Confidence
                </span>

                <span
                  className="font-mono font-medium"
                  style={{ color: resultColor }}
                >
                  {result.confidence.toFixed(1)}%
                </span>
              </div>

              <div
                className="h-1.5 rounded-[3px] overflow-hidden"
                style={{ background: 'var(--surface2)' }}
              >
                <div
                  className="h-full rounded-[3px] transition-all duration-700"
                  style={{
                    width: `${result.confidence}%`,
                    background: resultColor,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 py-3.5 flex flex-wrap gap-6">
            <Detail label="Model" value={result.model} />

            <Detail
              label="Inference"
              value={`${result.inference_ms} ms`}
            />

            <div className="flex-1 min-w-50">
              <div className="text-[11px] text-(--muted) mb-1 tracking-wider">
                Cleaned text
              </div>

              <div className="text-[12px] text-[#a0a0b8] font-mono leading-[1.6]">
                {result.cleaned_text || '—'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[11px] text(--muted) mb-1 tracking-wider">
        {label}
      </div>

      <div className="text-[13px] text-(--text) font-mono">
        {value}
      </div>
    </div>
  )
}

function Spinner({ color }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      style={{
        animation: 'spin 0.8s linear infinite',
      }}
    >
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <circle
        cx="7"
        cy="7"
        r="5"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="20"
        strokeDashoffset="15"
      />
    </svg>
  )
}