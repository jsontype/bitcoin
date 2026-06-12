import { WEIGHTS, bandFor } from '../indicators.js'
import { Sparkline, Histogram } from './Sparkline.jsx'
import Term from './Term.jsx'
import { useI18n } from '../i18n.js'

// 지표 1종 카드: 원시값 + 추이 + 0~100 부분점수 막대
export default function IndicatorCard({ meta, part }) {
  const { t } = useI18n()
  const ti = t.ind[meta.key] || { name: meta.name, desc: meta.desc }
  const s = part?.score
  const status = s == null ? 'na' : bandFor(s).color
  return (
    <article className={`ind-card status-${status}`}>
      <span className="corner tl" />
      <span className="corner br" />
      <div className="ind-head">
        <Term k={meta.key}>
          <span className="ind-short">{meta.short}</span>
        </Term>
        <span className="ind-weight">w {Math.round(WEIGHTS[meta.key] * 100)}%</span>
      </div>
      <div className="ind-name">{ti.name}</div>
      <div className="ind-value" style={{ color: 'var(--accent)' }}>
        {part ? part.value : '…'}
      </div>
      <div className="ind-detail">{part ? part.detail : ''}</div>

      {meta.key === 'MACD' && part?.series?.length ? (
        <Histogram data={part.series} />
      ) : part?.series?.length ? (
        <Sparkline
          data={part.series}
          color="var(--accent)"
          height={40}
          refLines={meta.key === 'RSI' ? [{ v: 30, color: 'rgba(0,255,156,.3)' }, { v: 70, color: 'rgba(255,59,92,.3)' }] : []}
        />
      ) : null}

      <div className="mini-bar">
        <div className="mini-fill" style={{ width: `${s == null ? 0 : s}%`, background: 'var(--accent)' }} />
      </div>
      <div className="mini-row">
        <span>{s == null ? <span className="na-flag">N/A · OFFLINE</span> : t.subScore}</span>
        <span>{s == null ? '' : s.toFixed(0) + ' / 100'}</span>
      </div>
      <div className="ind-desc">{ti.desc}</div>
    </article>
  )
}
