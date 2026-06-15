import { useEffect, useRef, useState } from 'react'
import { WEIGHTS, BANDS, INDICATOR_META } from '../indicators.js'
import { ago } from '../format.js'
import { useI18n } from '../i18n.js'

const SHOW_MAP = { rsi: 'RSI', macd: 'MACD', fng: 'FNG', mayer: 'Mayer', dd: 'DD', cross: 'GC_DC' }

export default function Terminal({ ctx }) {
  const { t } = useI18n()
  const tt = t.term
  const [lines, setLines] = useState([tt.welcome])
  const [input, setInput] = useState('')
  const [hist, setHist] = useState([])
  const [hi, setHi] = useState(-1)
  const bodyRef = useRef(null)
  // 데스크톱(정밀 포인터)에서만 자동 포커스. 터치 기기는 자동 포커스 금지 → 폰에서 키보드가 안 뜸
  const autoFocusInput = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(pointer: fine)').matches
  const print = (...out) => setLines((p) => [...p, ...out.flat()])
  const bandLabel = (b) => t.bands[b.id]?.label || b.label
  const bandAdvice = (b) => t.bands[b.id]?.advice || b.advice

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  function run(raw) {
    const cmd = raw.trim()
    if (!cmd) return
    print(`satoshi@btc:~$ ${cmd}`)
    setHist((h) => [...h, cmd])
    setHi(-1)
    const [name, ...args] = cmd.split(/\s+/)
    const a = ctx.analysisRef.current
    switch (name.toLowerCase()) {
      case 'help':
        print(tt.help)
        break
      case 'score':
        if (!a || a.score == null) {
          print(tt.needRefresh)
          break
        }
        print(
          `  BUY TIMING SCORE: ${a.score.toFixed(1)} / 100   [${bandLabel(a.band)}]`,
          `  ${bandAdvice(a.band)}`,
          tt.scoreCoverage(a.online, Math.round(a.coverage * 100)),
        )
        break
      case 'why': {
        if (!a || a.score == null) {
          print(tt.needData)
          break
        }
        const contribs = Object.keys(WEIGHTS)
          .map((k) => ({ k, v: a.parts[k].score, w: WEIGHTS[k] }))
          .filter((c) => c.v != null)
        const wsum = contribs.reduce((s, c) => s + c.w, 0)
        contribs
          .map((c) => ({ ...c, contr: (c.v * c.w) / wsum }))
          .sort((x, y) => y.contr - x.contr)
          .forEach((c) => print(`  ${c.k.padEnd(6)} score ${c.v.toFixed(0).padStart(3)} ×${c.w.toFixed(2)} → ${c.contr >= 0 ? '+' : ''}${c.contr.toFixed(1)}`))
        print(tt.whySum(a.score.toFixed(1)))
        break
      }
      case 'show': {
        const key = SHOW_MAP[(args[0] || '').toLowerCase()]
        if (!key || !a) {
          print(tt.showUsage)
          break
        }
        const m = INDICATOR_META.find((x) => x.key === key)
        const ti = t.ind[key] || { name: m.name, desc: m.desc }
        const p = a.parts[key]
        print(
          `  ${m.short} — ${ti.name}`,
          tt.showVal(p.value, p.detail),
          tt.showScore(p.score == null ? 'N/A' : p.score.toFixed(1) + '/100', Math.round(WEIGHTS[key] * 100)),
          `    ${ti.desc}`,
        )
        break
      }
      case 'bands':
        BANDS.forEach((b) => print(`  ${String(b.min).padStart(3)}~  ${bandLabel(b).padEnd(11)} ${bandAdvice(b)}`))
        break
      case 'sources': {
        const f = (s, label) =>
          `  ${label.padEnd(7)} ${s ? s.status + (s.source ? ' · ' + s.source : '') + (s.fetchedAt ? ' · ' + ago(s.fetchedAt) + ' ago' : '') : 'n/a'}`
        print(f(ctx.price, 'price'), f(ctx.klines, 'klines'), f(ctx.fng, 'fng'))
        break
      }
      case 'refresh':
        print(tt.refreshing)
        ctx.api.refresh()
        break
      case 'theme': {
        const ok = ctx.api.theme(args[0])
        print(ok ? tt.themeOk(args[0]) : tt.themeErr)
        break
      }
      case 'matrix':
        ctx.api.matrix(args[0] !== 'off')
        print(tt.matrixMsg(args[0] !== 'off'))
        break
      case 'clear':
        setLines([])
        break
      case 'whoami':
        print(tt.whoami)
        break
      default:
        print(tt.notFound(name))
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      run(input)
      setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!hist.length) return
      const i = hi < 0 ? hist.length - 1 : Math.max(0, hi - 1)
      setHi(i)
      setInput(hist[i])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (hi < 0) return
      const i = hi + 1
      if (i >= hist.length) {
        setHi(-1)
        setInput('')
      } else {
        setHi(i)
        setInput(hist[i])
      }
    }
  }

  return (
    <section className="terminal">
      <div className="term-head">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="term-title">~/btc-signal — shell</span>
      </div>
      <div className="term-body" ref={bodyRef} onClick={() => bodyRef.current?.querySelector('input')?.focus()}>
        {lines.map((l, i) => (
          <div key={i} className="term-line">
            {l}
          </div>
        ))}
        <div className="term-input-row">
          <span className="term-prompt">satoshi@btc:~$</span>
          <input autoFocus={autoFocusInput} value={input} spellCheck={false} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} />
        </div>
      </div>
    </section>
  )
}
