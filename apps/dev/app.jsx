/* =============================================================================
   broodev.com — 회사 포털 (사이드바 SPA · 해시 라우팅 · 13개 언어 i18n · 빌드 불필요)
   - i18n: window.WEB_I18N (i18n.js 코어 + i18n/<lang>.js 언어 데이터)
   ========================================================================== */
const { useState, useEffect, useCallback } = React;
const I18N = window.WEB_I18N;

const COMPANY = { operator: 'Y-Systems', ceo: 'jsontype', email: 'jsontyper@gmail.com' };

/* ---- 앱 카탈로그 (이름/링크는 고정, 설명은 추후 i18n 가능) ---- */
const APPS = [
  { slug: 'btc', name: 'BTC_SIGNAL', url: 'https://btc.broodev.com', category: '금융', status: 'live',
    desc: '비트코인 공포·탐욕 지수와 6개 지표를 합성한 매수 타이밍 점수(0~100).', tags: ['비트코인', '공포지수', '실시간'] },
];
/* ***! TODO: ROADMAP은 "예정" 플레이스홀더. 출시 시 APPS로 이동. (이름/설명 다국어화는 추후) */
const ROADMAP = [
  { slug: 'fx', name: '환율 계산기', category: '금융', status: 'soon', desc: '실시간 환율로 즉시 변환하는 다통화 계산기.' },
  { slug: 'dday', name: 'D-Day 카운터', category: '생활', status: 'soon', desc: '기념일·마감까지 남은 날짜를 카운트.' },
  { slug: 'qr', name: 'QR 생성기', category: '도구', status: 'soon', desc: '링크·텍스트를 QR 코드로 즉시 생성.' },
  { slug: 'unit', name: '단위 변환기', category: '도구', status: 'soon', desc: '길이·무게·온도 등 단위를 빠르게 변환.' },
  { slug: 'color', name: '컬러 팔레트', category: '디자인', status: 'soon', desc: '브랜드 컬러·팔레트 추출과 대비 검사.' },
  { slug: 'json', name: 'JSON 포매터', category: '개발', status: 'soon', desc: 'JSON 정렬·검증·트리 뷰.' },
  { slug: 'timer', name: '포모도로 타이머', category: '생산성', status: 'soon', desc: '집중·휴식 사이클 타이머.' },
];

/* ---- 공용 훅/컴포넌트 ---- */
function useHashRoute(def) {
  const get = () => (location.hash.replace(/^#\/?/, '') || def);
  const [route, setRoute] = useState(get());
  useEffect(() => {
    const on = () => { setRoute(get()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
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
function StatusTag({ status, t }) {
  if (status === 'live') return <span className="tag live">{t.st.live}</span>;
  if (status === 'beta') return <span className="tag beta">{t.st.beta}</span>;
  return <span className="tag soon">{t.st.soon}</span>;
}

/* ---- 회사 소개 ---- */
function AboutPage({ go, t }) {
  const a = t.about;
  return (
    <div className="prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <span style={{ fontSize: 40, color: 'var(--neon)', textShadow: '0 0 18px var(--neon)' }}>&gt;_</span>
        <h1 style={{ margin: 0 }}>brood<span className="muted">ev</span></h1>
      </div>
      <p className="lead">{a.lead}</p>
      <div className="row" style={{ margin: '18px 0 8px' }}>
        <a className="btn" onClick={() => go('apps')}>{a.btnApps}</a>
        <a className="btn ghost" onClick={() => go('contact')}>{a.btnContact}</a>
      </div>
      <h2>{a.doingH}</h2>
      <p><strong>{COMPANY.operator}</strong>{a.doingP}</p>
      <h2>{a.featH}</h2>
      <div className="cards" style={{ margin: '12px 0' }}>
        {a.feats.map((f, i) => <div className="card" key={i}><div className="k">{f.k}</div><div className="v" style={{ fontSize: 18 }}>{f.v}</div><div className="sub">{f.sub}</div></div>)}
      </div>
      <h2>{a.repH}</h2>
      <div className="table-wrap" style={{ margin: '12px 0' }}>
        <table className="tbl"><tbody>
          <tr className="clickable" onClick={() => window.open(APPS[0].url, '_blank', 'noopener')}>
            <td className="t-name">BTC_SIGNAL <span className="tag live">{t.st.live}</span></td>
            <td className="t-muted">{a.repDesc}</td>
            <td style={{ textAlign: 'right' }} className="neon">btc.broodev.com ↗</td>
          </tr>
        </tbody></table>
      </div>
      <h2>{a.infoH}</h2>
      <ul>
        <li>{a.opLabel}: <strong>{COMPANY.operator}</strong> ({a.ceoLabel} {COMPANY.ceo})</li>
        <li>{a.contactLabel}: <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></li>
        <li className="muted">{a.biz}</li>
      </ul>
      <hr className="divider" />
      <p className="muted" style={{ fontSize: 12 }}>© {COMPANY.operator} · broodev — {a.foot}</p>
    </div>
  );
}

/* ---- 유용한 앱들 ---- */
function Pager({ page, pages, onGo, label }) {
  if (pages <= 1) return null;
  const nums = []; for (let i = 1; i <= pages; i++) nums.push(i);
  return (
    <div className="pager">
      <span className="pinfo">{label}</span>
      <div className="pbtns">
        <button className="pbtn" disabled={page <= 1} onClick={() => onGo(page - 1)}>‹</button>
        {nums.map(n => <button key={n} className={'pbtn' + (n === page ? ' active' : '')} onClick={() => onGo(n)}>{n}</button>)}
        <button className="pbtn" disabled={page >= pages} onClick={() => onGo(page + 1)}>›</button>
      </div>
    </div>
  );
}
function AppsPage({ t, fmt }) {
  const ALL = [...APPS, ...ROADMAP];
  const [q, setQ] = useState(''); const [page, setPage] = useState(1);
  const pageSize = 6; const ql = q.trim().toLowerCase();
  useEffect(() => { setPage(1); }, [ql]);
  const filtered = ALL.filter(a => !ql || (a.name + a.desc + a.category).toLowerCase().includes(ql));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const open = (a) => { if (a.status === 'live' && a.url) window.open(a.url, '_blank', 'noopener'); };
  return (
    <>
      <PageHead title={t.apps.title} desc={fmt(t.apps.descTpl, { a: APPS.length, b: ROADMAP.length })} />
      <div className="row" style={{ marginBottom: 14 }}>
        <input className="input" placeholder={t.apps.search} value={q} onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>{t.apps.thApp}</th><th>{t.apps.thDesc}</th><th>{t.apps.thCat}</th><th>{t.apps.thStatus}</th><th style={{ textAlign: 'right' }}>{t.apps.thLink}</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5}><div className="empty">{t.apps.empty}</div></td></tr>}
            {rows.map(a => (
              <tr key={a.slug} className={a.status === 'live' ? 'clickable' : ''} onClick={() => open(a)}>
                <td className="t-name">{a.name}</td>
                <td className="t-muted">{a.desc}</td>
                <td className="t-muted">{a.category}</td>
                <td><StatusTag status={a.status} t={t} /></td>
                <td style={{ textAlign: 'right' }} className={a.status === 'live' ? 'neon' : 't-muted'}>{a.status === 'live' ? a.url.replace('https://', '') + ' ↗' : t.apps.soonCell}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={cur} pages={pages} onGo={setPage} label={fmt(t.apps.pageTpl, { a: cur, b: pages })} />
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>{t.apps.note}</p>
    </>
  );
}

function Note({ t, children }) { return <div className="mock-note"><b>⚠ {t.mock}</b><span>{children}</span></div>; }

/* ---- 소식 ---- */
function NewsPage({ t }) {
  return (
    <>
      <PageHead title={t.news.title} desc={t.news.desc} />
      <Note t={t}>{t.news.mock}</Note>
      <div className="stack">
        {t.news.items.map((n, i) => (
          <div className="panel" key={i}>
            <div className="row" style={{ justifyContent: 'space-between' }}><span className="tag beta">{n.tag}</span></div>
            <h3 style={{ color: 'var(--text)', margin: '10px 0 4px', fontSize: 15 }}>{n.title}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>{n.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- 멤버십 ---- */
function MembershipPage({ t }) {
  const m = t.mem;
  const plans = [
    { name: m.freeName, price: '₩0', cta: m.freeCta, accent: false, feats: m.freeFeats },
    { name: m.lifeName, price: '₩—', cta: m.lifeCta, accent: true, feats: m.lifeFeats },
  ];
  return (
    <>
      <PageHead title={m.title} desc={m.desc} />
      <Note t={t}>{m.mock}</Note>
      <div className="cards">
        {plans.map((p, i) => (
          <div className="panel" key={i} style={p.accent ? { borderColor: 'var(--neon)', boxShadow: '0 0 30px -12px var(--neon)' } : null}>
            {p.accent && <><span className="corner tl" /><span className="corner br" /></>}
            <div className="panel-label">{p.name}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: p.accent ? 'var(--neon)' : 'var(--text)' }}>{p.price}</div>
            <ul style={{ margin: '12px 0', paddingLeft: 18, fontSize: 13, color: 'var(--dim)' }}>{p.feats.map((f, j) => <li key={j} style={{ margin: '5px 0' }}>{f}</li>)}</ul>
            <button className={'btn block' + (p.accent ? '' : ' ghost')} disabled={p.accent}>{p.cta}</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- 문의 ---- */
function ContactPage({ t }) {
  const c = t.contact;
  const [f, setF] = useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(f.name + '\n' + f.email + '\n\n' + f.msg);
    window.location.href = 'mailto:' + COMPANY.email + '?subject=' + encodeURIComponent('[broodev] ' + f.name) + '&body=' + body;
    setSent(true);
  };
  return (
    <>
      <PageHead title={c.title} desc={c.desc} />
      <Note t={t}>{c.mock}</Note>
      <form className="panel" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="field"><label>{c.lblName}</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></div>
        <div className="field"><label>{c.lblEmail}</label><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required /></div>
        <div className="field"><label>{c.lblMsg}</label><textarea value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} required /></div>
        <button className="btn block" type="submit">{c.btn}</button>
        {sent && <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>{c.sent} <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></p>}
      </form>
    </>
  );
}

/* ---- 개인정보처리방침 ---- */
function PrivacyPage({ t }) {
  const pv = t.privacy;
  return (
    <div className="prose">
      <h1>{pv.title}</h1>
      <p className="muted">{pv.eff}: 2026-06-16 · {pv.op}: {COMPANY.operator}</p>
      <p>{pv.intro}</p>
      {pv.s.map((x, i) => (<React.Fragment key={i}><h2>{x.h}</h2><p>{x.p}{i === pv.s.length - 1 ? <> <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></> : null}</p></React.Fragment>))}
    </div>
  );
}

/* ---- 이용약관 ---- */
function TermsPage({ t }) {
  const tm = t.terms;
  return (
    <div className="prose">
      <h1>{tm.title}</h1>
      <p className="muted">{tm.eff}: 2026-06-16 · {tm.op}: {COMPANY.operator}</p>
      {tm.a.map((x, i) => (<React.Fragment key={i}><h2>{x.h}</h2><p>{x.p}{i === tm.a.length - 1 ? <> <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></> : null}</p></React.Fragment>))}
    </div>
  );
}

const SECTIONS = { about: AboutPage, apps: AppsPage, news: NewsPage, membership: MembershipPage, contact: ContactPage, privacy: PrivacyPage, terms: TermsPage };

/* ---- 앱 셸 ---- */
function App() {
  const [route, go] = useHashRoute('about');
  const [navOpen, setNavOpen] = useState(false);
  const [lang, setLangState] = useState(() => I18N.detectLang());
  const t = I18N.getT(lang);
  const setLang = (code) => { setLangState(code); try { localStorage.setItem('broodev:lang', code); } catch (e) {} };
  useEffect(() => { setNavOpen(false); }, [route]);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { const u = new URL(location.href); if (u.searchParams.get('lang') !== lang) { u.searchParams.set('lang', lang); history.replaceState(null, '', u); } } catch (e) {}
  }, [lang]);

  const NAV = [
    { group: t.grp.company, items: [{ id: 'about', icon: '▸', label: t.nav.about }, { id: 'apps', icon: '▦', label: t.nav.apps }] },
    { group: t.grp.more, items: [{ id: 'news', icon: '✷', label: t.nav.news }, { id: 'membership', icon: '★', label: t.nav.membership }, { id: 'contact', icon: '✉', label: t.nav.contact }] },
    { group: t.grp.policy, items: [{ id: 'privacy', icon: '§', label: t.nav.privacy }, { id: 'terms', icon: '§', label: t.nav.terms }] },
  ];
  const flat = NAV.flatMap(g => g.items);
  const Section = SECTIONS[route] || AboutPage;
  const current = flat.find(n => n.id === route);

  return (
    <>
      <div className={'scrim' + (navOpen ? ' show' : '')} onClick={() => setNavOpen(false)} />
      <div className="layout">
        <aside className={'sidebar' + (navOpen ? ' open' : '')}>
          <div className="side-brand"><span className="side-logo">&gt;_</span><span className="side-title">brood<span className="dim">ev</span></span></div>
          <div className="side-nav">
            {NAV.map(group => (
              <React.Fragment key={group.group}>
                <div className="nav-label">{group.group}</div>
                {group.items.map(it => (
                  <a key={it.id} className={'nav-link' + (route === it.id ? ' active' : '')} onClick={() => go(it.id)}><span className="nico">{it.icon}</span>{it.label}</a>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="side-foot">© {COMPANY.operator} · broodev<br />{t.foot}</div>
        </aside>
        <main className="main">
          <header className="topbar">
            <button className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="menu">≡</button>
            <span className="topbar-title">{current ? current.label : 'broodev'}</span>
            <div className="topbar-right">
              <LangSelect lang={lang} setLang={setLang} />
              <a className="chip" href="https://btc.broodev.com" target="_blank" rel="noopener">btc ↗</a>
              <Clock />
            </div>
          </header>
          <div className="content"><Section go={go} t={t} fmt={I18N.fmt} /></div>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
