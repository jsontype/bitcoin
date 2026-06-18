/* =============================================================================
   admin.broodev.com — 운영 관리자 콘솔 (사이드바 SPA · 13개 언어 i18n · 빌드 불필요)
   - i18n: window.ADMIN_I18N (i18n.js 코어 + i18n/<lang>.js)
   - Google SSO 게이트(jsontyper@gmail.com 단독), noindex
   ========================================================================== */
const { useState, useEffect, useCallback, useRef } = React;
const I18N = window.ADMIN_I18N;

const ADMIN = { brand: 'broodev', sub: 'admin', operator: 'Y-Systems' };
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com'; // ***! TODO: 실제 OAuth 클라이언트 ID
const ALLOWED_EMAIL = 'jsontyper@gmail.com';
const NEEDS_SETUP = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_');

/* ---- 공용 ---- */
function useHashRoute(def) {
  const get = () => (location.hash.replace(/^#\/?/, '') || def);
  const [route, setRoute] = useState(get());
  useEffect(() => { const on = () => setRoute(get()); window.addEventListener('hashchange', on); return () => window.removeEventListener('hashchange', on); }, []);
  const go = useCallback((id) => { location.hash = '#/' + id; }, []);
  return [route, go];
}
function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const p = (n) => String(n).padStart(2, '0');
  return (<div className="clock"><span className="clock-time">{p(now.getHours())}:{p(now.getMinutes())}:{p(now.getSeconds())}</span><span className="clock-date">{now.getFullYear()}.{p(now.getMonth() + 1)}.{p(now.getDate())}</span></div>);
}
function LangSelect({ lang, setLang }) {
  return (
    <span className="lang-select" title="Language">
      <span className="lang-globe">🌐</span>
      <select value={lang} onChange={e => setLang(e.target.value)} aria-label="Language">
        {I18N.LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </span>
  );
}
function PageHead({ title, desc }) { return <div className="page-head"><h1>{title}</h1>{desc && <p>{desc}</p>}</div>; }
function Note({ t, children }) { return <div className="mock-note"><b>⚠ {t.mock}</b><span>{children}</span></div>; }
function StatusTag({ s }) {
  const m = { ok: ['live', 'OK'], live: ['live', 'LIVE'], warn: ['soon', 'WARN'], crit: ['', 'ERR'] };
  const [cls, txt] = m[s] || ['', s];
  return <span className={'tag ' + cls} style={s === 'crit' ? { color: 'var(--crit)', borderColor: 'rgba(255,59,92,.4)' } : null}>{txt}</span>;
}

/* ***! TODO: MOCK_* 는 목업 데이터(기술값). 백엔드 연동 시 실데이터로 교체. */
const MOCK_APPS = [
  { name: 'BTC_SIGNAL', domain: 'btc.broodev.com', status: 'live', collectors: 3, lastSync: '—' },
  { name: 'web', domain: 'broodev.com', status: 'live', collectors: 0, lastSync: '—' },
];
const MOCK_COLLECTORS = [
  { id: 'btc-price', app: 'btc', source: 'CoinGecko / Binance', schedule: '1m', last: '2m', status: 'ok' },
  { id: 'btc-fng', app: 'btc', source: 'Alternative.me', schedule: '1h', last: '12m', status: 'ok' },
  { id: 'btc-klines', app: 'btc', source: 'Binance klines', schedule: '1h', last: '12m', status: 'warn' },
];
const MOCK_LOGS = [
  { ts: '14:32:08', app: 'btc', event: 'price.fetch', detail: 'BTC=64,210 USD', level: 'ok' },
  { ts: '14:31:08', app: 'btc', event: 'price.fetch', detail: 'BTC=64,190 USD', level: 'ok' },
  { ts: '14:20:00', app: 'btc', event: 'fng.fetch', detail: 'index=38 (fear)', level: 'ok' },
  { ts: '14:20:00', app: 'btc', event: 'klines.fetch', detail: 'binance 451 → coingecko fallback', level: 'warn' },
  { ts: '14:00:00', app: 'btc', event: 'fng.fetch', detail: 'index=40 (fear)', level: 'ok' },
  { ts: '13:32:01', app: 'btc', event: 'price.fetch', detail: 'BTC=63,980 USD', level: 'ok' },
];
const MOCK_VISITS = [120, 180, 150, 220, 300, 260, 340];

/* ---- 섹션 ---- */
function DashboardPage({ go, t }) {
  const d = t.dash;
  return (
    <>
      <PageHead title={d.title} desc={d.desc} />
      <Note t={t}>{d.mock}</Note>
      <div className="cards">
        <div className="card"><div className="k">{d.cApps}</div><div className="v">{MOCK_APPS.length}</div><div className="sub">{d.cAppsSub}</div></div>
        <div className="card"><div className="k">{d.cJobs}</div><div className="v ok">{MOCK_COLLECTORS.length}</div><div className="sub">{d.cJobsSub}</div></div>
        <div className="card"><div className="k">{d.cVisit}</div><div className="v">340</div><div className="sub">{d.cVisitSub}</div></div>
        <div className="card"><div className="k">{d.cRev}</div><div className="v warn">$—</div><div className="sub">{d.cRevSub}</div></div>
      </div>
      <hr className="divider" />
      <div className="row" style={{ alignItems: 'stretch', gap: 16 }}>
        <div className="panel" style={{ flex: '1 1 320px' }}>
          <div className="panel-label">{d.recent}</div>
          {MOCK_LOGS.slice(0, 5).map((l, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
              <span className="muted">{l.ts}</span><span className="neon" style={{ flex: 1, margin: '0 10px' }}>{l.event}</span>
              <span className={l.level === 'warn' ? '' : 'muted'} style={l.level === 'warn' ? { color: 'var(--warn)' } : null}>{l.detail}</span>
            </div>
          ))}
        </div>
        <div className="panel" style={{ flex: '1 1 260px' }}>
          <div className="panel-label">{d.collectStatus}</div>
          {MOCK_COLLECTORS.map(c => (
            <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
              <span className="neon">{c.id}</span><span className="muted">{c.last}</span><StatusTag s={c.status} />
            </div>
          ))}
          <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => go('collect')}>{d.manageCollect}</button>
        </div>
      </div>
    </>
  );
}
function AppsPage({ t }) {
  const a = t.appsP;
  return (
    <>
      <PageHead title={a.title} desc={a.desc} />
      <Note t={t}>{a.mock}</Note>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>{a.thApp}</th><th>{a.thDomain}</th><th>{a.thJobs}</th><th>{a.thSync}</th><th>{a.thStatus}</th></tr></thead>
        <tbody>{MOCK_APPS.map(x => (<tr key={x.domain}><td className="t-name">{x.name}</td><td className="t-muted">{x.domain}</td><td className="t-muted">{x.collectors}</td><td className="t-muted">{x.lastSync}</td><td><StatusTag s={x.status} /></td></tr>))}</tbody>
      </table></div>
    </>
  );
}
function CollectPage({ t }) {
  const c = t.collect;
  const [busy, setBusy] = useState('');
  const run = (id) => { setBusy(id); setTimeout(() => setBusy(''), 900); }; // ***! TODO: 실제 수집 트리거
  return (
    <>
      <PageHead title={c.title} desc={c.desc} />
      <Note t={t}>{c.mock}</Note>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>{c.thId}</th><th>{c.thApp}</th><th>{c.thSource}</th><th>{c.thSched}</th><th>{c.thLast}</th><th>{c.thStatus}</th><th></th></tr></thead>
        <tbody>{MOCK_COLLECTORS.map(j => (
          <tr key={j.id}><td className="t-name">{j.id}</td><td className="t-muted">{j.app}</td><td className="t-muted">{j.source}</td><td className="t-muted">{j.schedule}</td><td className="t-muted">{j.last}</td><td><StatusTag s={j.status} /></td>
            <td style={{ textAlign: 'right' }}><button className="chip" disabled={busy === j.id} onClick={() => run(j.id)}>{busy === j.id ? c.running : c.run}</button></td></tr>
        ))}</tbody>
      </table></div>
    </>
  );
}
function QueriesPage({ t }) {
  const q = t.queries;
  const [app, setApp] = useState('all'); const [level, setLevel] = useState('all');
  const rows = MOCK_LOGS.filter(l => (app === 'all' || l.app === app) && (level === 'all' || l.level === level));
  return (
    <>
      <PageHead title={q.title} desc={q.desc} />
      <Note t={t}>{q.mock}</Note>
      <div className="row" style={{ marginBottom: 12 }}>
        <select className="input" value={app} onChange={e => setApp(e.target.value)}><option value="all">{q.allApps}</option><option value="btc">btc</option></select>
        <select className="input" value={level} onChange={e => setLevel(e.target.value)}><option value="all">{q.allLevels}</option><option value="ok">ok</option><option value="warn">warn</option></select>
      </div>
      <div className="table-wrap"><table className="tbl">
        <thead><tr><th>{q.thTime}</th><th>{q.thApp}</th><th>{q.thEvent}</th><th>{q.thDetail}</th></tr></thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={4}><div className="empty">{q.empty}</div></td></tr>}
          {rows.map((l, i) => (<tr key={i}><td className="t-muted">{l.ts}</td><td className="t-muted">{l.app}</td><td className="t-name">{l.event}</td><td className={l.level === 'warn' ? '' : 't-muted'} style={l.level === 'warn' ? { color: 'var(--warn)' } : null}>{l.detail}</td></tr>))}
        </tbody>
      </table></div>
    </>
  );
}
function AnalyticsPage({ t, lang }) {
  const an = t.analytics;
  const max = Math.max(...MOCK_VISITS);
  let days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  try { const f = new Intl.DateTimeFormat(lang, { weekday: 'short' }); days = [0, 1, 2, 3, 4, 5, 6].map(i => f.format(new Date(2024, 0, 1 + i))); } catch (e) {}
  return (
    <>
      <PageHead title={an.title} desc={an.desc} />
      <Note t={t}>{an.mock}</Note>
      <div className="cards" style={{ marginBottom: 16 }}>
        <div className="card"><div className="k">{an.c7d}</div><div className="v">{MOCK_VISITS.reduce((a, b) => a + b, 0)}</div></div>
        <div className="card"><div className="k">{an.cDwell}</div><div className="v" style={{ fontSize: 22 }}>2:14</div></div>
        <div className="card"><div className="k">{an.cRpm}</div><div className="v warn">$—</div><div className="sub">{an.cRpmSub}</div></div>
      </div>
      <div className="panel">
        <div className="panel-label">{an.visits7d}</div>
        <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: 140, marginTop: 8 }}>
          {MOCK_VISITS.map((v, i) => (<div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ height: Math.round((v / max) * 110), background: 'linear-gradient(180deg,var(--neon),rgba(0,255,156,.2))', borderRadius: '3px 3px 0 0', boxShadow: '0 0 12px -2px var(--neon)' }} />
            <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>{days[i]}</div>
          </div>))}
        </div>
      </div>
    </>
  );
}
function TerminalPage({ user, t }) {
  const [lines, setLines] = useState([{ t: 'broodev admin shell — type `help` to start.', c: 'dim' }]);
  const [val, setVal] = useState('');
  const bodyRef = useRef(null); const inputRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines]);
  const print = (arr) => setLines(l => [...l, ...arr]);
  const run = (raw) => {
    const cmd = raw.trim(); print([{ t: '$ ' + cmd, c: 'neon' }]);
    const [c, ...args] = cmd.split(/\s+/);
    switch ((c || '').toLowerCase()) {
      case '': break;
      case 'help': print([{ t: 'commands: help · status · apps · collectors · collect <id> · logs · whoami · clear' }]); break;
      case 'status': print([{ t: `apps: ${MOCK_APPS.length} · collectors: ${MOCK_COLLECTORS.length} (1 warn)`, c: 'ok' }, { t: 'today visits: 340 · est. revenue: $—', c: 'dim' }]); break;
      case 'apps': print(MOCK_APPS.map(a => ({ t: `• ${a.name.padEnd(12)} ${a.domain.padEnd(20)} [${a.status}]` }))); break;
      case 'collectors': print(MOCK_COLLECTORS.map(j => ({ t: `• ${j.id.padEnd(12)} ${j.schedule.padEnd(4)} last:${j.last} [${j.status}]`, c: j.status === 'warn' ? 'warn' : undefined }))); break;
      case 'collect': {
        const id = args[0]; const job = MOCK_COLLECTORS.find(j => j.id === id);
        if (!id) { print([{ t: 'usage: collect <job-id>', c: 'warn' }]); break; }
        if (!job) { print([{ t: `unknown job: ${id}`, c: 'crit' }]); break; }
        print([{ t: `triggering ${id}…` }]); setTimeout(() => print([{ t: `✓ ${id} done (mock)`, c: 'ok' }]), 700); break;
      }
      case 'logs': print(MOCK_LOGS.slice(0, 6).map(l => ({ t: `${l.ts} [${l.app}] ${l.event} — ${l.detail}`, c: l.level === 'warn' ? 'warn' : 'dim' }))); break;
      case 'whoami': print([{ t: (user && user.email) || 'unknown', c: 'ok' }]); break;
      case 'clear': setLines([]); break;
      default: print([{ t: `command not found: ${c} (try 'help')`, c: 'crit' }]);
    }
  };
  const onKey = (e) => { if (e.key === 'Enter') { run(val); setVal(''); } };
  return (
    <>
      <PageHead title={t.term.title} desc={t.term.desc} />
      <div className="terminal">
        <div className="term-head"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="term-title">broodev — admin@console</span></div>
        <div className="term-body" ref={bodyRef} onClick={() => inputRef.current && inputRef.current.focus()}>
          {lines.map((l, i) => (<div key={i} className="term-line"><span className={l.c || ''}>{l.t}</span></div>))}
          <div className="term-input-row"><span className="term-prompt">$</span><input ref={inputRef} value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKey} spellCheck={false} placeholder="help" /></div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 10 }}>{t.term.note}</p>
    </>
  );
}
function SettingsPage({ t }) {
  const s = t.settings;
  const [saved, setSaved] = useState(false);
  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 1500); }; // ***! TODO: 실제 저장
  return (
    <>
      <PageHead title={s.title} desc={s.desc} />
      <Note t={t}>{s.mock}</Note>
      <form className="panel" style={{ maxWidth: 560 }} onSubmit={save}>
        <div className="panel-label">{s.general}</div>
        <div className="field"><label>{s.siteName}</label><input defaultValue="broodev" /></div>
        <div className="field"><label>{s.opEmail}</label><input defaultValue="jsontyper@gmail.com" /></div>
        <hr className="divider" />
        <div className="panel-label">{s.integ}</div>
        {/* ***! TODO: 키는 백엔드 비밀저장소에 보관, 프런트 노출 금지 */}
        <div className="field"><label>AdSense Publisher</label><input defaultValue="pub-2639315913402952" /></div>
        <div className="field"><label>Analytics (GA4) ID</label><input placeholder="G-XXXXXXX" /></div>
        <hr className="divider" />
        <div className="panel-label">{s.notiTheme}</div>
        <label className="toggle" style={{ marginBottom: 12 }}><input type="checkbox" defaultChecked /> {s.notiToggle}</label>
        <div className="field"><label>{s.themeColor}</label><select defaultValue="green"><option value="green">green</option><option value="cyan">cyan</option><option value="amber">amber</option></select></div>
        <div className="row" style={{ marginTop: 8 }}><button className="btn" type="submit">{s.save}</button>{saved && <span className="neon" style={{ fontSize: 12 }}>{s.saved}</span>}</div>
      </form>
      <div className="panel" style={{ maxWidth: 560, marginTop: 16, borderColor: 'rgba(255,59,92,.4)' }}>
        <div className="panel-label" style={{ color: 'var(--crit)' }}>{s.danger}</div>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>{s.dangerP}</p>
        <button className="btn ghost" style={{ borderColor: 'rgba(255,59,92,.5)', color: 'var(--crit)' }}>{s.dangerBtn}</button>
      </div>
    </>
  );
}

const SECTIONS = { dashboard: DashboardPage, apps: AppsPage, collect: CollectPage, queries: QueriesPage, analytics: AnalyticsPage, terminal: TerminalPage, settings: SettingsPage };

/* ---- SSO 게이트 ---- */
function decodeJwt(token) { try { const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(decodeURIComponent(escape(atob(b)))); } catch (e) { return null; } }
function CenterCard({ children }) {
  return (<div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
    <div className="panel" style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}><span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />{children}</div></div>);
}
function LoginScreen({ onCredential, onDevLogin, t, lang, setLang }) {
  const ref = useRef(null);
  useEffect(() => {
    if (NEEDS_SETUP) return;
    let tries = 0;
    const tm = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(tm);
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => onCredential(r.credential) });
        if (ref.current) window.google.accounts.id.renderButton(ref.current, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'center' });
      } else if (++tries > 50) { clearInterval(tm); }
    }, 100);
    return () => clearInterval(tm);
  }, []);
  return (
    <CenterCard>
      <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 4 }}><LangSelect lang={lang} setLang={setLang} /></div>
      <div style={{ fontSize: 34, color: 'var(--neon)', textShadow: '0 0 18px var(--neon)' }}>⚙</div>
      <h2 style={{ color: 'var(--neon)', margin: '8px 0 4px', fontSize: 18 }}>broodev · admin</h2>
      <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>{t.sso.sub}</p>
      {NEEDS_SETUP ? (
        <div style={{ textAlign: 'left', marginTop: 14 }}>
          <div className="mock-note"><b>⚠</b><span>{t.sso.setup}</span></div>
          <ol className="muted" style={{ fontSize: 11.5, lineHeight: 1.7, paddingLeft: 18, margin: '0 0 10px' }}>
            <li>{t.sso.step1}</li>
            <li>{t.sso.step2b} <span className="kbd">https://admin.broodev.com</span> {t.sso.step2a}</li>
            <li>{t.sso.step3a} <span className="kbd">app.jsx</span>{t.sso.step3b}</li>
          </ol>
          <button className="btn ghost block" onClick={onDevLogin}>{t.sso.devLogin}</button>
        </div>
      ) : (<div ref={ref} style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }} />)}
      <p className="muted" style={{ fontSize: 10, marginTop: 16 }}>{t.sso.noSignup}</p>
    </CenterCard>
  );
}
function DeniedScreen({ user, onSignOut, t }) {
  return (<CenterCard>
    <div style={{ fontSize: 30, color: 'var(--crit)' }}>✕</div>
    <h2 style={{ color: 'var(--crit)', margin: '8px 0 4px', fontSize: 18 }}>{t.sso.deniedH}</h2>
    <p className="muted" style={{ fontSize: 12 }}><b>{user.email}</b> — {t.sso.deniedP}</p>
    <button className="btn ghost block" style={{ marginTop: 12 }} onClick={onSignOut}>{t.sso.other}</button>
  </CenterCard>);
}
function AuthGate({ children, t, lang, setLang }) {
  const [user, setUser] = useState(null);
  const onCredential = (cred) => { const p = decodeJwt(cred); if (p && p.email) setUser({ email: p.email, name: p.name, picture: p.picture }); };
  const onDevLogin = () => setUser({ email: ALLOWED_EMAIL, name: 'admin (dev)', picture: null, dev: true });
  const signOut = () => { try { window.google && window.google.accounts && window.google.accounts.id.disableAutoSelect(); } catch (e) {} setUser(null); };
  if (!user) return <LoginScreen onCredential={onCredential} onDevLogin={onDevLogin} t={t} lang={lang} setLang={setLang} />;
  if (user.email !== ALLOWED_EMAIL) return <DeniedScreen user={user} onSignOut={signOut} t={t} />;
  return children(user, signOut);
}
function UserChip({ user, onSignOut, t }) {
  return (<span className="row" style={{ gap: 8 }}>
    {user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--line)' }} />
      : <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon)', fontSize: 12 }}>{(user.name || 'A')[0]}</span>}
    <span className="muted" style={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}{user.dev ? ' (dev)' : ''}</span>
    <button className="chip" onClick={onSignOut}>{t.logout}</button>
  </span>);
}

/* ---- 관리자 셸 ---- */
function AdminApp({ user, onSignOut, t, lang, setLang }) {
  const [route, go] = useHashRoute('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => { setNavOpen(false); }, [route]);
  const NAV = [
    { group: t.grp.ops, items: [{ id: 'dashboard', icon: '▣', label: t.nav.dashboard }, { id: 'apps', icon: '▦', label: t.nav.apps }] },
    { group: t.grp.data, items: [{ id: 'collect', icon: '⇩', label: t.nav.collect }, { id: 'queries', icon: '⌕', label: t.nav.queries }, { id: 'analytics', icon: '∿', label: t.nav.analytics }] },
    { group: t.grp.tools, items: [{ id: 'terminal', icon: '▸', label: t.nav.terminal }, { id: 'settings', icon: '⚙', label: t.nav.settings }] },
  ];
  const flat = NAV.flatMap(g => g.items);
  const Section = SECTIONS[route] || DashboardPage;
  const current = flat.find(n => n.id === route);
  return (
    <>
      <div className={'scrim' + (navOpen ? ' show' : '')} onClick={() => setNavOpen(false)} />
      <div className="layout">
        <aside className={'sidebar' + (navOpen ? ' open' : '')}>
          <div className="side-brand"><span className="side-logo">⚙</span><span className="side-title">{ADMIN.brand}<span className="dim"> · {ADMIN.sub}</span></span></div>
          <div className="side-nav">
            {NAV.map(group => (<React.Fragment key={group.group}><div className="nav-label">{group.group}</div>
              {group.items.map(it => (<a key={it.id} className={'nav-link' + (route === it.id ? ' active' : '')} onClick={() => go(it.id)}><span className="nico">{it.icon}</span>{it.label}</a>))}
            </React.Fragment>))}
          </div>
          <div className="side-foot">© {ADMIN.operator}<br />{t.foot}</div>
        </aside>
        <main className="main">
          <header className="topbar">
            <button className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="menu">≡</button>
            <span className="topbar-title">{current ? current.label : t.admin}</span>
            <div className="topbar-right">
              <span className="sys-status status-ok"><span className="pulse" />{t.online}</span>
              <LangSelect lang={lang} setLang={setLang} />
              <UserChip user={user} onSignOut={onSignOut} t={t} />
              <Clock />
            </div>
          </header>
          <div className="content"><Section go={go} user={user} t={t} lang={lang} /></div>
        </main>
      </div>
    </>
  );
}

/* ---- 루트 (lang 상태) ---- */
function Root() {
  const [lang, setLangState] = useState(() => I18N.detectLang());
  const t = I18N.getT(lang);
  const setLang = (c) => { setLangState(c); try { localStorage.setItem('broodev:lang', c); } catch (e) {} };
  useEffect(() => {
    document.documentElement.lang = lang;
    try { const u = new URL(location.href); if (u.searchParams.get('lang') !== lang) { u.searchParams.set('lang', lang); history.replaceState(null, '', u); } } catch (e) {}
  }, [lang]);
  return <AuthGate t={t} lang={lang} setLang={setLang}>{(user, signOut) => <AdminApp user={user} onSignOut={signOut} t={t} lang={lang} setLang={setLang} />}</AuthGate>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
