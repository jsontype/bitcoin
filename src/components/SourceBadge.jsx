import { ago } from '../format.js'
import Term from './Term.jsx'
import { useI18n } from '../i18n.js'

const TIP_KEY = { live: 'src_live', fallback: 'src_fallback', cached: 'src_cached', error: 'src_offline' }

// 데이터 소스의 상태(live/fallback/cached/error/loading)와 신선도 배지
export default function SourceBadge({ label, src }) {
  const { t } = useI18n()
  const st = src?.status || 'loading'
  const txt =
    st === 'live'
      ? src.source
      : st === 'fallback'
        ? src.source + ' (' + t.src.fallback + ')'
        : st === 'cached'
          ? t.src.cached + ' ' + ago(src.fetchedAt)
          : st === 'error'
            ? t.src.offline
            : t.src.loading
  return (
    <Term k={TIP_KEY[st]} align="right" underline={false}>
      <span className={`badge ${st}`}>
        <span className="bdot" />
        {label}: {txt}
      </span>
    </Term>
  )
}
