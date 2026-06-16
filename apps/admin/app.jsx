/* =============================================================================
   admin.broodev.com — 운영 관리자 콘솔 (사이드바 SPA · 빌드 불필요)
   - #7 셸 스캐폴드(현재): 레이아웃 + 메뉴 + 빈 섹션
   - #8 Google SSO 게이트(jsontyper@gmail.com 단독)
   - #9 대시보드/앱/수집/조회/애널리틱스/설정 (목업)
   - #10 터미널 패널
   ⚠ 관리자 콘솔은 데이터 수집/운영용. 검색엔진 비노출(noindex).
   ========================================================================== */
const { useState, useEffect, useCallback } = React;

const ADMIN = { brand: 'broodev', sub: 'admin', operator: 'Y-Systems' };

/* ---- 내비게이션 --------------------------------------------------------- */
const NAV = [
  { group: '운영', items: [
    { id: 'dashboard', icon: '▣', label: '대시보드' },
    { id: 'apps',      icon: '▦', label: '앱' },
  ]},
  { group: '데이터', items: [
    { id: 'collect',   icon: '⇩', label: '데이터 수집' },
    { id: 'queries',   icon: '⌕', label: '조회 / 로그' },
    { id: 'analytics', icon: '∿', label: '애널리틱스' },
  ]},
  { group: '도구', items: [
    { id: 'terminal',  icon: '▸', label: '터미널' },
    { id: 'settings',  icon: '⚙', label: '설정' },
  ]},
];
const FLAT_NAV = NAV.flatMap(g => g.items);

/* ---- 공용 훅/컴포넌트 --------------------------------------------------- */
function useHashRoute(def) {
  const get = () => (location.hash.replace(/^#\/?/, '') || def);
  const [route, setRoute] = useState(get());
  useEffect(() => {
    const on = () => setRoute(get());
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
  return (
    <div className="clock">
      <span className="clock-time">{p(now.getHours())}:{p(now.getMinutes())}:{p(now.getSeconds())}</span>
      <span className="clock-date">{now.getFullYear()}.{p(now.getMonth() + 1)}.{p(now.getDate())}</span>
    </div>
  );
}

function PageHead({ title, desc }) {
  return <div className="page-head"><h1>{title}</h1>{desc && <p>{desc}</p>}</div>;
}

/* ---- 섹션 (#9/#10에서 구현) -------------------------------------------- */
function DashboardPage() { return (<><PageHead title="대시보드" /><div className="empty">준비 중…</div></>); }
function AppsPage()      { return (<><PageHead title="앱" /><div className="empty">준비 중…</div></>); }
function CollectPage()   { return (<><PageHead title="데이터 수집" /><div className="empty">준비 중…</div></>); }
function QueriesPage()   { return (<><PageHead title="조회 / 로그" /><div className="empty">준비 중…</div></>); }
function AnalyticsPage() { return (<><PageHead title="애널리틱스" /><div className="empty">준비 중…</div></>); }
function TerminalPage()  { return (<><PageHead title="터미널" /><div className="empty">준비 중…</div></>); }
function SettingsPage()  { return (<><PageHead title="설정" /><div className="empty">준비 중…</div></>); }

const SECTIONS = {
  dashboard: DashboardPage, apps: AppsPage, collect: CollectPage,
  queries: QueriesPage, analytics: AnalyticsPage, terminal: TerminalPage, settings: SettingsPage,
};

/* ---- 관리자 셸 --------------------------------------------------------- */
function AdminApp() {
  const [route, go] = useHashRoute('dashboard');
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => { setNavOpen(false); }, [route]);
  const Section = SECTIONS[route] || DashboardPage;
  const current = FLAT_NAV.find(n => n.id === route);

  return (
    <>
      <div className={'scrim' + (navOpen ? ' show' : '')} onClick={() => setNavOpen(false)} />
      <div className="layout">
        <aside className={'sidebar' + (navOpen ? ' open' : '')}>
          <div className="side-brand">
            <span className="side-logo">⚙</span>
            <span className="side-title">{ADMIN.brand}<span className="dim"> · {ADMIN.sub}</span></span>
          </div>
          <div className="side-nav">
            {NAV.map(group => (
              <React.Fragment key={group.group}>
                <div className="nav-label">{group.group}</div>
                {group.items.map(it => (
                  <a key={it.id} className={'nav-link' + (route === it.id ? ' active' : '')} onClick={() => go(it.id)}>
                    <span className="nico">{it.icon}</span>{it.label}
                  </a>
                ))}
              </React.Fragment>
            ))}
          </div>
          <div className="side-foot">© {ADMIN.operator}<br />운영 콘솔 · 내부용</div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="메뉴">≡</button>
            <span className="topbar-title">{current ? current.label : '관리자'}</span>
            <div className="topbar-right">
              <span className="sys-status status-ok"><span className="pulse" />ONLINE</span>
              {/* ***! TODO(#8): 실제 Google 로그인 사용자/로그아웃으로 교체 */}
              <span className="chip">관리자</span>
              <Clock />
            </div>
          </header>
          <div className="content"><Section go={go} /></div>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminApp />);
