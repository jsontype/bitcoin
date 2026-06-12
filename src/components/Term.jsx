import { createContext, useContext } from 'react'
import { GLOSSARY } from '../glossary.js'
import { useI18n } from '../i18n.js'

// 툴팁 표시 여부 전역 컨텍스트 (헤더 체크박스로 토글)
export const TipsContext = createContext(true)

// 어려운 용어를 감싸 hover/focus 시 쉬운 설명 툴팁을 띄운다.
// tips가 꺼져 있거나 사전에 없는 key면 그냥 children만 렌더. (현재 언어 기준)
export default function Term({ k, children, align = 'left', underline = true }) {
  const tips = useContext(TipsContext)
  const { lang } = useI18n()
  const g = (GLOSSARY[lang] || GLOSSARY.en)[k]
  if (!tips || !g) return children ?? g?.title ?? null
  return (
    <span className={`term${underline ? ' u' : ''}`} tabIndex={0}>
      {children ?? g.title}
      <span className={`tip${align === 'right' ? ' tip-r' : ''}`} role="tooltip">
        <span className="tip-title">{g.title}</span>
        <span className="tip-body">{g.body}</span>
      </span>
    </span>
  )
}
