import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { computeAnalysis, INDICATOR_META } from './indicators.js'
import { loadPrice, loadKlines, loadFng, loadCache } from './api.js'
import { fmtUsd, fmtPct, fmtCompact } from './format.js'
import MatrixRain from './components/MatrixRain.jsx'
import BootSequence from './components/BootSequence.jsx'
import IndicatorCard from './components/IndicatorCard.jsx'
import SourceBadge from './components/SourceBadge.jsx'
import Terminal from './components/Terminal.jsx'
import { Sparkline } from './components/Sparkline.jsx'
import Term, { TipsContext } from './components/Term.jsx'
import { LANGS, getT, I18nContext, detectLang } from './i18n.js'

const THEMES = { green: '#00ff9c', cyan: '#00e5ff', amber: '#ffb000', red: '#ff3b5c' }
const localeOf = (lang) => (LANGS.find((l) => l.code === lang) || LANGS[0]).locale

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function App() {
  const [price, setPrice] = useState(null)
  const [klines, setKlines] = useState(null)
  const [fng, setFng] = useState(null)
  const [accent, setAccent] = useLocalStorage('btc:accent', THEMES.green)
  const [matrixOn, setMatrixOn] = useLocalStorage('btc:matrix', true)
  const [tipsOn, setTipsOn] = useLocalStorage('btc:tips', true)
  const [lang, setLang] = useLocalStorage('btc:lang', detectLang())
  const [scoreHist, setScoreHist] = useLocalStorage('btc:scoreHist', [])
  const [booted, setBooted] = useState(() => sessionStorage.getItem('btcbooted') === '1')
  const now = useClock()
  const t = getT(lang)
  const locale = localeOf(lang)

  useEffect(() => {
    document.documentElement.style.setProperty('--neon', accent)
  }, [accent])

  const refresh = useCallback(() => {
    setPrice((p) => (p ? { ...p, status: 'loading' } : p))
    loadPrice().then(setPrice)
    setKlines((k) => (k ? { ...k, status: 'loading' } : k))
    loadKlines().then(setKlines)
    setFng((f) => (f ? { ...f, status: 'loading' } : f))
    loadFng().then(setFng)
  }, [])

  // 부팅: 캐시 하이드레이션(즉시 렌더) → 라이브 페치 → 폴링(탭 hidden 시 정지)
  useEffect(() => {
    const pc = loadCache('btc:price')
    if (pc) setPrice({ ...pc.data, status: 'cached', fetchedAt: pc.fetchedAt })
    const kc = loadCache('btc:klines')
    if (kc) setKlines({ ...kc.data, status: 'cached', fetchedAt: kc.fetchedAt })
    const fc = loadCache('btc:fng')
    if (fc) setFng({ ...fc.data, status: 'cached', fetchedAt: fc.fetchedAt })
    refresh()
    let n = 0
    const id = setInterval(() => {
      if (document.hidden) return
      n++
      loadPrice().then(setPrice)
      if (n % 10 === 0) loadKlines().then(setKlines)
      if (n % 60 === 0) loadFng().then(setFng)
    }, 60000)
    return () => clearInterval(id)
  }, [refresh])

  const analysis = useMemo(() => {
    const closes = klines?.closes || []
    const fngArr = fng?.arr || []
    const livePrice = price?.price ?? (closes.length ? closes[closes.length - 1] : null)
    if (!closes.length && !fngArr.length) return null
    return computeAnalysis({ closes, fngArr, livePrice, t, times: klines?.times, fngTimes: fng?.times })
  }, [klines, fng, price, t])

  const analysisRef = useRef(analysis)
  analysisRef.current = analysis

  // 점수 추이 기록 (값이 바뀔 때만)
  const lastScore = useRef(null)
  useEffect(() => {
    if (!analysis || analysis.score == null) return
    if (lastScore.current === analysis.score) return
    lastScore.current = analysis.score
    setScoreHist((prev) => [...prev, { t: Date.now(), s: analysis.score }].slice(-80))
  }, [analysis?.score, setScoreHist])

  const api = useMemo(
    () => ({
      refresh,
      theme: (name) => {
        if (!THEMES[name]) return false
        setAccent(THEMES[name])
        return true
      },
      matrix: (on) => setMatrixOn(!!on),
    }),
    [refresh, setAccent, setMatrixOn],
  )

  const finishBoot = useCallback(() => {
    sessionStorage.setItem('btcbooted', '1')
    setBooted(true)
  }, [])

  if (!booted) return <BootSequence onDone={finishBoot} t={t} />

  const band = analysis?.band
  const sysColor = band ? band.color : 'warn'
  const score = analysis?.score
  const gaugeColor = band ? `var(--${band.color})` : 'var(--dim)'
  const r = 90
  const circ = 2 * Math.PI * r
  const dash = ((score || 0) / 100) * circ
  const chgUp = (price?.change24hPct ?? 0) >= 0
  const priceStale = price?.fetchedAt && Date.now() - price.fetchedAt > 5 * 60000

  const ctx = { analysisRef, price, klines, fng, api }

  return (
    <I18nContext.Provider value={{ lang, t }}>
    <TipsContext.Provider value={tipsOn}>
    <div className={`app status-${sysColor}`}>
      <MatrixRain enabled={matrixOn} accent={accent} />
      <div className="scanlines" />
      <div className="vignette" />

      <div className="shell">
        <header className="topbar">
          <div className="brand">
            <span className="logo">₿▰▱</span>
            <div>
              <h1 className="title">
                BTC_SIGNAL <span className="dim">// {t.tagline}</span>
              </h1>
              <p className="subtitle">{t.subtitle}</p>
            </div>
          </div>
          <div className="topbar-right">
            <label className="lang-select" title={t.langLabel}>
              <span className="lang-globe" aria-hidden="true">🌐</span>
              <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t.langLabel}>
                {LANGS.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="tips-toggle" title={t.tipsHint}>
              <input type="checkbox" checked={tipsOn} onChange={(e) => setTipsOn(e.target.checked)} />
              <span>{t.tips} {tipsOn ? 'ON' : 'OFF'}</span>
            </label>
            <div className={`sys-status status-${sysColor}`}>
              <span className="pulse" />
              {band ? t.bands[band.id]?.label || band.label : t.loading}
            </div>
            <div className="clock">
              <span className="clock-time">{now.toLocaleTimeString(locale, { hour12: false })}</span>
              <span className="clock-date">{now.toLocaleDateString(locale)}</span>
            </div>
          </div>
        </header>

        <div className="disclaimer-banner" role="note">
          <span className="dz-icon">⚠</span>
          <span>
            {t.banner.p1} <strong>{t.banner.s1}</strong> {t.banner.p2} <strong>{t.banner.s2}</strong> {t.banner.p3}
          </span>
        </div>

        <section className="hero">
          <div className={`panel gauge-panel status-${sysColor}`} style={{ '--accent': gaugeColor }}>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <div className="panel-label">// <Term k="score">{t.buyTimingScore}</Term></div>
            <div className="gauge-big">
              <svg viewBox="0 0 210 210">
                <circle cx="105" cy="105" r={r} className="gauge-track" />
                <circle
                  cx="105"
                  cy="105"
                  r={r}
                  className="gauge-fill"
                  stroke={gaugeColor}
                  strokeDasharray={`${dash} ${circ}`}
                  transform="rotate(-90 105 105)"
                />
              </svg>
              <div className="gauge-center">
                <span className="gauge-score" style={{ color: gaugeColor }}>
                  {score == null ? '--' : score.toFixed(0)}
                </span>
                <span className="gauge-of">/ 100</span>
              </div>
            </div>
            <div className="verdict" style={{ color: gaugeColor }}>
              {band ? t.bands[band.id]?.label || band.label : '…'}
            </div>
            <div className="verdict-advice">{band ? t.bands[band.id]?.advice || band.advice : t.dataLoading}</div>
            <div className="coverage">
              {analysis ? (
                <>
                  <Term k="coverage">{t.indicatorsOnline(analysis.online)}</Term> · {t.higherMoreBuy}
                </>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className="panel market" style={{ '--accent': accent }}>
            <span className="corner tl" />
            <span className="corner br" />
            <div className="market-top">
              <div>
                <div className="panel-label">
                  // BTC / USD{' '}
                  {priceStale && (
                    <Term k="stale">
                      <span className="na-flag">{t.stale}</span>
                    </Term>
                  )}
                </div>
                <div className="price-big">{fmtUsd(price?.price)}</div>
                <div className="price-sub">
                  <Term k="chg24">
                    <span className={`chg ${chgUp ? 'up' : 'down'}`}>{fmtPct(price?.change24hPct)} (24h)</span>
                  </Term>
                  <Term k="vol">
                    <span>{t.vol} {fmtCompact(price?.vol24h)}</span>
                  </Term>
                  {price?.marketCap != null && (
                    <Term k="mcap">
                      <span>{t.mcap} {fmtCompact(price.marketCap)}</span>
                    </Term>
                  )}
                </div>
              </div>
              <div className="badges-row">
                <SourceBadge label="price" src={price} />
                <SourceBadge label="hist" src={klines} />
                <SourceBadge label="f&g" src={fng} />
              </div>
            </div>
            <div className="spark-wrap">
              <div className="spark-title">
                <span>{t.priceHistory(Math.min(120, klines?.closes?.length || 0))}</span>
                <span>{klines?.source || ''}</span>
              </div>
              {klines?.closes?.length ? (
                <Sparkline data={klines.closes.slice(-120)} times={klines.times?.slice(-120)} color={accent} height={64} fmt={fmtUsd} />
              ) : (
                <div className="spark-empty">{t.histLoading}</div>
              )}
            </div>
            <div className="spark-wrap">
              <div className="spark-title">
                <span>{t.scoreTrend}</span>
                <span>{scoreHist.length}p</span>
              </div>
              {scoreHist.length > 1 ? (
                <Sparkline
                  data={scoreHist.map((h) => h.s)}
                  times={scoreHist.map((h) => h.t)}
                  color={gaugeColor}
                  height={48}
                  baseline={0}
                  fmt={(v) => String(Math.round(v))}
                  refLines={[{ v: 65, color: 'rgba(0,255,156,.25)' }, { v: 45, color: 'rgba(255,176,0,.25)' }]}
                />
              ) : (
                <div className="spark-empty spark-sm">{t.trendAccrues}</div>
              )}
            </div>
          </div>
        </section>

        <section className="ind-grid">
          {INDICATOR_META.map((m) => (
            <IndicatorCard key={m.key} meta={m} part={analysis?.parts?.[m.key]} />
          ))}
        </section>

        <Terminal ctx={ctx} />

        <footer className="footer">
          <span>
            {t.footer} {t.dataLabel} CoinGecko · Binance · Alternative.me
          </span>
          <span className="footer-cmds">
            <button className="chip" onClick={refresh}>
              ↻ {t.refresh}
            </button>
            <button className="chip" onClick={() => setMatrixOn((v) => !v)}>
              matrix:{matrixOn ? 'on' : 'off'}
            </button>
            <button
              className="chip"
              onClick={() => {
                // 현재 점수를 시드로 남겨 차트가 '지금'부터 다시 쌓이게 한다
                setScoreHist(analysis?.score != null ? [{ t: Date.now(), s: analysis.score }] : [])
                lastScore.current = analysis?.score ?? null
              }}
            >
              {t.clearHistory}
            </button>
          </span>
        </footer>
      </div>
    </div>
    </TipsContext.Provider>
    </I18nContext.Provider>
  )
}
