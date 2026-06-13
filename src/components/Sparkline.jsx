// 라인 스파크라인 + (MACD용) 히스토그램.
// times(데이터와 같은 길이의 타임스탬프)가 주어지면 "인터랙티브 모드":
//   - 하단 X축에 시간 라벨(기간이 짧으면 HH:MM, 길면 M/D)
//   - 마우스/터치 호버 시 수직 크로스헤어 + 해당 지점 값 툴팁
import { useState } from 'react'
import { useI18n, LANGS } from '../i18n.js'

export function Sparkline({ data = [], times = null, color = '#00ff9c', height = 64, refLines = [], baseline, fmt }) {
  const { t, lang } = useI18n()
  const [hi, setHi] = useState(null)
  const W = 600
  if (!data || data.length < 2) return <div className="spark-empty">// {t.det.nodata}</div>
  const pad = 3
  const max = Math.max(...data)
  const min = Math.min(...data, baseline != null ? baseline : Infinity)
  const span = max - min || 1
  const stepX = (W - pad * 2) / (data.length - 1)
  const Y = (v) => height - pad - ((v - min) / span) * (height - pad * 2)
  const pts = data.map((v, i) => [pad + i * stepX, Y(v)])
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${pad},${height - pad} ${line} ${(W - pad).toFixed(1)},${height - pad}`
  const [lx, ly] = pts[pts.length - 1]

  const svg = (
    <svg className="spark" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      {refLines.map((rl, i) => {
        const y = Y(rl.v)
        return <line key={i} x1="0" x2={W} y1={y} y2={y} stroke={rl.color || 'rgba(255,255,255,.15)'} strokeWidth="1" strokeDasharray="4 4" />
      })}
      <polygon points={area} fill={color} opacity="0.12" />
      <polyline points={line} fill="none" stroke={color} strokeWidth="1.6" />
      <circle cx={lx} cy={ly} r="2.8" fill={color}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.4s" repeatCount="indefinite" />
      </circle>
    </svg>
  )

  const interactive = Array.isArray(times) && times.length === data.length
  if (!interactive) return svg

  const locale = (LANGS.find((l) => l.code === lang) || LANGS[0]).locale
  const totalSpan = times[times.length - 1] - times[0]
  const tickFmt = (ts) =>
    totalSpan < 36 * 3600 * 1000
      ? new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : new Date(ts).toLocaleDateString(locale, { month: 'numeric', day: 'numeric' })
  const fmtVal = fmt || ((v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v))))
  const xPct = (i) => ((pad + i * stepX) / W) * 100
  const yPct = (v) => (Y(v) / height) * 100
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const frac = rect.width ? Math.max(0, Math.min(1, cx / rect.width)) : 0
    setHi(Math.round(frac * (data.length - 1)))
  }
  const mid = Math.floor((data.length - 1) / 2)
  const tipX = hi != null ? xPct(hi) : 0
  const tipTransform = tipX < 12 ? 'translateX(0)' : tipX > 88 ? 'translateX(-100%)' : 'translateX(-50%)'

  return (
    <div className="spark-ix">
      <div
        className="spark-plot"
        onMouseMove={onMove}
        onMouseLeave={() => setHi(null)}
        onTouchStart={onMove}
        onTouchMove={onMove}
        onTouchEnd={() => setHi(null)}
      >
        {svg}
        {hi != null && (
          <>
            <div className="spark-cross" style={{ left: `${tipX}%` }} />
            <div className="spark-dot" style={{ left: `${tipX}%`, top: `${yPct(data[hi])}%`, color }} />
            <div className="spark-tip" style={{ left: `${tipX}%`, transform: tipTransform }}>
              <b>{fmtVal(data[hi])}</b>
              <span>{tickFmt(times[hi])}</span>
            </div>
          </>
        )}
      </div>
      <div className="spark-axis">
        <span>{tickFmt(times[0])}</span>
        <span>{tickFmt(times[mid])}</span>
        <span>{tickFmt(times[times.length - 1])}</span>
      </div>
    </div>
  )
}

export function Histogram({ data = [], times = null, height = 40, fmt }) {
  const { t, lang } = useI18n()
  const [hi, setHi] = useState(null)
  const W = 600
  if (!data || data.length < 2) return <div className="spark-empty spark-sm">// {t.det.nodata}</div>
  const maxAbs = Math.max(...data.map((v) => Math.abs(v))) || 1
  const bw = W / data.length
  const mid = height / 2
  const svg = (
    <svg className="spark spark-sm" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none">
      <line x1="0" x2={W} y1={mid} y2={mid} stroke="rgba(255,255,255,.15)" strokeWidth="1" />
      {data.map((v, i) => {
        const h = (Math.abs(v) / maxAbs) * (mid - 2)
        return (
          <rect
            key={i}
            x={i * bw}
            y={v >= 0 ? mid - h : mid}
            width={Math.max(1, bw - 0.5)}
            height={h}
            fill={v >= 0 ? 'var(--ok)' : 'var(--crit)'}
            opacity="0.85"
          />
        )
      })}
    </svg>
  )

  const interactive = Array.isArray(times) && times.length === data.length
  if (!interactive) return svg

  const locale = (LANGS.find((l) => l.code === lang) || LANGS[0]).locale
  const totalSpan = times[times.length - 1] - times[0]
  const tickFmt = (ts) =>
    totalSpan < 36 * 3600 * 1000
      ? new Date(ts).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
      : new Date(ts).toLocaleDateString(locale, { month: 'numeric', day: 'numeric' })
  const fmtVal = fmt || ((v) => (Math.abs(v) >= 1000 ? Math.round(v).toLocaleString() : String(Math.round(v))))
  const xPct = (i) => ((i * bw + bw / 2) / W) * 100
  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const frac = rect.width ? Math.max(0, Math.min(1, cx / rect.width)) : 0
    setHi(Math.min(data.length - 1, Math.floor(frac * data.length)))
  }
  const mid2 = Math.floor((data.length - 1) / 2)
  const tipX = hi != null ? xPct(hi) : 0
  const tipTransform = tipX < 12 ? 'translateX(0)' : tipX > 88 ? 'translateX(-100%)' : 'translateX(-50%)'

  return (
    <div className="spark-ix">
      <div
        className="spark-plot"
        onMouseMove={onMove}
        onMouseLeave={() => setHi(null)}
        onTouchStart={onMove}
        onTouchMove={onMove}
        onTouchEnd={() => setHi(null)}
      >
        {svg}
        {hi != null && (
          <>
            <div className="spark-cross" style={{ left: `${tipX}%` }} />
            <div className="spark-tip" style={{ left: `${tipX}%`, transform: tipTransform }}>
              <b>{fmtVal(data[hi])}</b>
              <span>{tickFmt(times[hi])}</span>
            </div>
          </>
        )}
      </div>
      <div className="spark-axis">
        <span>{tickFmt(times[0])}</span>
        <span>{tickFmt(times[mid2])}</span>
        <span>{tickFmt(times[times.length - 1])}</span>
      </div>
    </div>
  )
}
