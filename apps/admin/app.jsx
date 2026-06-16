/* =============================================================================
   admin.broodev.com — 운영 관리자 콘솔 (사이드바 SPA · 빌드 불필요)
   - #7 셸 스캐폴드(현재): 레이아웃 + 메뉴 + 빈 섹션
   - #8 Google SSO 게이트(jsontyper@gmail.com 단독)
   - #9 대시보드/앱/수집/조회/애널리틱스/설정 (목업)
   - #10 터미널 패널
   ⚠ 관리자 콘솔은 데이터 수집/운영용. 검색엔진 비노출(noindex).
   ========================================================================== */
const { useState, useEffect, useCallback, useRef } = React;

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

function MockNote({ children }) { return <div className="mock-note"><b>⚠ 목업</b><span>{children}</span></div>; }
function StatusTag({ s }) {
  const m = { ok: ['live', 'OK'], live: ['live', 'LIVE'], warn: ['soon', 'WARN'], crit: ['', 'ERR'] };
  const [cls, txt] = m[s] || ['', s];
  return <span className={'tag ' + cls} style={s === 'crit' ? { color: 'var(--crit)', borderColor: 'rgba(255,59,92,.4)' } : null}>{txt}</span>;
}

/* ***! TODO: 아래 MOCK_* 는 전부 목업 데이터입니다. 백엔드(수집 잡 + DB) 연동 시 실데이터로 교체. */
const MOCK_APPS = [
  { name: 'BTC_SIGNAL', domain: 'btc.broodev.com', status: 'live', collectors: 3, lastSync: '2분 전' },
  { name: 'web (포털)', domain: 'broodev.com', status: 'live', collectors: 0, lastSync: '—' },
];
const MOCK_COLLECTORS = [
  { id: 'btc-price', app: 'btc', source: 'CoinGecko / Binance', schedule: '매 1분', last: '2분 전', status: 'ok' },
  { id: 'btc-fng', app: 'btc', source: 'Alternative.me', schedule: '매 1시간', last: '12분 전', status: 'ok' },
  { id: 'btc-klines', app: 'btc', source: 'Binance klines', schedule: '매 1시간', last: '12분 전', status: 'warn' },
];
const MOCK_LOGS = [
  { ts: '14:32:08', app: 'btc', event: 'price.fetch', detail: 'BTC=64,210 USD', level: 'ok' },
  { ts: '14:31:08', app: 'btc', event: 'price.fetch', detail: 'BTC=64,190 USD', level: 'ok' },
  { ts: '14:20:00', app: 'btc', event: 'fng.fetch', detail: 'index=38 (fear)', level: 'ok' },
  { ts: '14:20:00', app: 'btc', event: 'klines.fetch', detail: 'binance 451 → coingecko 폴백', level: 'warn' },
  { ts: '14:00:00', app: 'btc', event: 'fng.fetch', detail: 'index=40 (fear)', level: 'ok' },
  { ts: '13:32:01', app: 'btc', event: 'price.fetch', detail: 'BTC=63,980 USD', level: 'ok' },
];
const MOCK_VISITS = [120, 180, 150, 220, 300, 260, 340]; // 최근 7일

/* ---- 대시보드 ---------------------------------------------------------- */
function DashboardPage({ go }) {
  return (
    <>
      <PageHead title="대시보드" desc="broodev 운영 요약" />
      <MockNote>지표·수익은 예시 값입니다. 실데이터는 백엔드 연동 후 표시됩니다.</MockNote>
      <div className="cards">
        <div className="card"><div className="k">앱</div><div className="v">{MOCK_APPS.length}</div><div className="sub">운영 중</div></div>
        <div className="card"><div className="k">활성 수집 잡</div><div className="v ok">{MOCK_COLLECTORS.length}</div><div className="sub">1개 경고</div></div>
        <div className="card"><div className="k">오늘 방문</div><div className="v">340</div><div className="sub">어제 대비 +30%</div></div>
        <div className="card"><div className="k">추정 수익(월)</div><div className="v warn">$—</div><div className="sub">AdSense 연동 예정</div></div>
      </div>
      <hr className="divider" />
      <div className="row" style={{ alignItems: 'stretch', gap: 16 }}>
        <div className="panel" style={{ flex: '1 1 320px' }}>
          <div className="panel-label">최근 활동</div>
          {MOCK_LOGS.slice(0, 5).map((l, i) => (
            <div key={i} className="row" style={{ justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
              <span className="muted">{l.ts}</span>
              <span className="neon" style={{ flex: 1, margin: '0 10px' }}>{l.event}</span>
              <span className={l.level === 'warn' ? '' : 'muted'} style={l.level === 'warn' ? { color: 'var(--warn)' } : null}>{l.detail}</span>
            </div>
          ))}
        </div>
        <div className="panel" style={{ flex: '1 1 260px' }}>
          <div className="panel-label">수집 상태</div>
          {MOCK_COLLECTORS.map(c => (
            <div key={c.id} className="row" style={{ justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
              <span className="neon">{c.id}</span><span className="muted">{c.last}</span><StatusTag s={c.status} />
            </div>
          ))}
          <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => go('collect')}>수집 관리 →</button>
        </div>
      </div>
    </>
  );
}

/* ---- 앱 ---------------------------------------------------------------- */
function AppsPage() {
  return (
    <>
      <PageHead title="앱" desc="등록된 broodev 앱" />
      <MockNote>앱 등록/상태는 추후 백엔드와 동기화됩니다.</MockNote>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>앱</th><th>도메인</th><th>수집 잡</th><th>최근 동기화</th><th>상태</th></tr></thead>
          <tbody>
            {MOCK_APPS.map(a => (
              <tr key={a.domain}>
                <td className="t-name">{a.name}</td>
                <td className="t-muted">{a.domain}</td>
                <td className="t-muted">{a.collectors}</td>
                <td className="t-muted">{a.lastSync}</td>
                <td><StatusTag s={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---- 데이터 수집 ------------------------------------------------------- */
function CollectPage() {
  const [busy, setBusy] = useState('');
  const run = (id) => { setBusy(id); setTimeout(() => setBusy(''), 900); }; // ***! TODO: 실제 수집 트리거(API) 연동
  return (
    <>
      <PageHead title="데이터 수집" desc="수집 잡 관리 · 수동 실행" />
      <MockNote>“지금 수집”은 동작만 흉내냅니다. 실제 트리거는 백엔드 연동 시.</MockNote>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>잡 ID</th><th>앱</th><th>소스</th><th>주기</th><th>최근</th><th>상태</th><th></th></tr></thead>
          <tbody>
            {MOCK_COLLECTORS.map(c => (
              <tr key={c.id}>
                <td className="t-name">{c.id}</td>
                <td className="t-muted">{c.app}</td>
                <td className="t-muted">{c.source}</td>
                <td className="t-muted">{c.schedule}</td>
                <td className="t-muted">{c.last}</td>
                <td><StatusTag s={c.status} /></td>
                <td style={{ textAlign: 'right' }}><button className="chip" disabled={busy === c.id} onClick={() => run(c.id)}>{busy === c.id ? '실행 중…' : '지금 수집'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---- 조회 / 로그 ------------------------------------------------------- */
function QueriesPage() {
  const [app, setApp] = useState('all');
  const [level, setLevel] = useState('all');
  const rows = MOCK_LOGS.filter(l => (app === 'all' || l.app === app) && (level === 'all' || l.level === level));
  return (
    <>
      <PageHead title="조회 / 로그" desc="수집 이벤트 로그" />
      <MockNote>예시 로그입니다. 실제 조회는 수집 DB 연동 후.</MockNote>
      <div className="row" style={{ marginBottom: 12 }}>
        <select className="input" value={app} onChange={e => setApp(e.target.value)}>
          <option value="all">전체 앱</option><option value="btc">btc</option>
        </select>
        <select className="input" value={level} onChange={e => setLevel(e.target.value)}>
          <option value="all">전체 레벨</option><option value="ok">ok</option><option value="warn">warn</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>시각</th><th>앱</th><th>이벤트</th><th>상세</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={4}><div className="empty">결과 없음</div></td></tr>}
            {rows.map((l, i) => (
              <tr key={i}>
                <td className="t-muted">{l.ts}</td><td className="t-muted">{l.app}</td>
                <td className="t-name">{l.event}</td>
                <td className={l.level === 'warn' ? '' : 't-muted'} style={l.level === 'warn' ? { color: 'var(--warn)' } : null}>{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---- 애널리틱스 -------------------------------------------------------- */
function AnalyticsPage() {
  const max = Math.max(...MOCK_VISITS);
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  return (
    <>
      <PageHead title="애널리틱스" desc="트래픽 · 수익" />
      <MockNote>방문·수익은 예시 값입니다. GA4 / AdSense API 연동 예정.</MockNote>
      <div className="cards" style={{ marginBottom: 16 }}>
        <div className="card"><div className="k">7일 방문</div><div className="v">{MOCK_VISITS.reduce((a, b) => a + b, 0)}</div></div>
        <div className="card"><div className="k">평균 체류</div><div className="v" style={{ fontSize: 22 }}>2분 14초</div></div>
        <div className="card"><div className="k">추정 RPM</div><div className="v warn">$—</div><div className="sub">AdSense 연동 후</div></div>
      </div>
      <div className="panel">
        <div className="panel-label">최근 7일 방문</div>
        <div className="row" style={{ alignItems: 'flex-end', gap: 10, height: 140, marginTop: 8 }}>
          {MOCK_VISITS.map((v, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ height: Math.round((v / max) * 110), background: 'linear-gradient(180deg,var(--neon),rgba(0,255,156,.2))', borderRadius: '3px 3px 0 0', boxShadow: '0 0 12px -2px var(--neon)' }} />
              <div className="muted" style={{ fontSize: 10, marginTop: 4 }}>{days[i]}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ---- 터미널 (명령 콘솔) ------------------------------------------------ */
function TerminalPage({ user }) {
  const [lines, setLines] = useState([{ t: 'broodev admin shell — `help` 로 시작하세요.', c: 'dim' }]);
  const [val, setVal] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight; }, [lines]);
  const print = (arr) => setLines(l => [...l, ...arr]);

  const run = (raw) => {
    const cmd = raw.trim();
    print([{ t: '$ ' + cmd, c: 'neon' }]);
    const [c, ...args] = cmd.split(/\s+/);
    switch ((c || '').toLowerCase()) {
      case '': break;
      case 'help': print([{ t: 'commands: help · status · apps · collectors · collect <id> · logs · whoami · clear' }]); break;
      case 'status': print([
        { t: `apps: ${MOCK_APPS.length} · collectors: ${MOCK_COLLECTORS.length} (1 warn)`, c: 'ok' },
        { t: 'today visits: 340 · est. revenue: $— (AdSense 연동 예정)', c: 'dim' },
      ]); break;
      case 'apps': print(MOCK_APPS.map(a => ({ t: `• ${a.name.padEnd(12)} ${a.domain.padEnd(20)} [${a.status}]` }))); break;
      case 'collectors': print(MOCK_COLLECTORS.map(j => ({ t: `• ${j.id.padEnd(12)} ${j.schedule.padEnd(8)} last:${j.last} [${j.status}]`, c: j.status === 'warn' ? 'warn' : undefined }))); break;
      case 'collect': {
        const id = args[0];
        const job = MOCK_COLLECTORS.find(j => j.id === id);
        if (!id) { print([{ t: 'usage: collect <job-id>', c: 'warn' }]); break; }
        if (!job) { print([{ t: `unknown job: ${id}`, c: 'crit' }]); break; }
        print([{ t: `triggering ${id}…` }]);
        setTimeout(() => print([{ t: `✓ ${id} done (mock)`, c: 'ok' }]), 700); // ***! TODO: 실제 수집 API 호출
        break;
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
      <PageHead title="터미널" desc="운영 명령 콘솔" />
      <div className="terminal">
        <div className="term-head"><span className="dot red" /><span className="dot yellow" /><span className="dot green" /><span className="term-title">broodev — admin@console</span></div>
        <div className="term-body" ref={bodyRef} onClick={() => inputRef.current && inputRef.current.focus()}>
          {lines.map((l, i) => (<div key={i} className="term-line"><span className={l.c || ''}>{l.t}</span></div>))}
          <div className="term-input-row">
            <span className="term-prompt">$</span>
            <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)} onKeyDown={onKey} spellCheck={false} placeholder="help" />
          </div>
        </div>
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 10 }}>※ collect 등 실제 동작은 백엔드 연동 후입니다. 지금은 목업 응답.</p>
    </>
  );
}

/* ---- 설정 ------------------------------------------------------------- */
function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const save = (e) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 1500); }; // ***! TODO: 실제 저장(백엔드/설정 API)
  return (
    <>
      <PageHead title="설정" desc="일반 · 연동 · 테마" />
      <MockNote>저장은 아직 서버에 반영되지 않습니다(화면용).</MockNote>
      <form className="panel" style={{ maxWidth: 560 }} onSubmit={save}>
        <div className="panel-label">일반</div>
        <div className="field"><label>사이트 이름</label><input defaultValue="broodev" /></div>
        <div className="field"><label>운영자 이메일</label><input defaultValue="jsontyper@gmail.com" /></div>

        <hr className="divider" />
        <div className="panel-label">연동 (API 키)</div>
        {/* ***! TODO: 키는 백엔드 비밀저장소(예: CF secrets)에 보관. 프런트 노출 금지. */}
        <div className="field"><label>AdSense Publisher</label><input defaultValue="pub-2639315913402952" /></div>
        <div className="field"><label>Analytics (GA4) ID</label><input placeholder="G-XXXXXXX" /></div>

        <hr className="divider" />
        <div className="panel-label">알림 / 테마</div>
        <label className="toggle" style={{ marginBottom: 12 }}><input type="checkbox" defaultChecked /> 수집 실패 시 이메일 알림</label>
        <div className="field"><label>테마 강조색</label>
          <select defaultValue="green"><option value="green">green (기본)</option><option value="cyan">cyan</option><option value="amber">amber</option></select>
        </div>

        <div className="row" style={{ marginTop: 8 }}>
          <button className="btn" type="submit">저장</button>
          {saved && <span className="neon" style={{ fontSize: 12 }}>✓ 저장됨 (목업)</span>}
        </div>
      </form>
      <div className="panel" style={{ maxWidth: 560, marginTop: 16, borderColor: 'rgba(255,59,92,.4)' }}>
        <div className="panel-label" style={{ color: 'var(--crit)' }}>위험 구역</div>
        <p className="muted" style={{ fontSize: 12, margin: '0 0 10px' }}>캐시/수집 데이터를 초기화합니다. (목업 — 동작 안 함)</p>
        <button className="btn ghost" style={{ borderColor: 'rgba(255,59,92,.5)', color: 'var(--crit)' }}>수집 캐시 비우기</button>
      </div>
    </>
  );
}

const SECTIONS = {
  dashboard: DashboardPage, apps: AppsPage, collect: CollectPage,
  queries: QueriesPage, analytics: AnalyticsPage, terminal: TerminalPage, settings: SettingsPage,
};

/* ---- Google SSO 게이트 (운영자 단독) -----------------------------------
   ***! TODO: GOOGLE_CLIENT_ID 를 Google Cloud Console에서 발급한 OAuth 2.0
   클라이언트 ID로 교체하고, "승인된 자바스크립트 원본"에 https://admin.broodev.com
   (+ CF Pages 프리뷰 도메인)을 등록하세요.
   ⚠ 클라이언트측 검증은 "진짜 보안"이 아닙니다 — 실제 보호는 백엔드 토큰 검증 필요. */
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_OAUTH_CLIENT_ID.apps.googleusercontent.com';
const ALLOWED_EMAIL = 'jsontyper@gmail.com';
const NEEDS_SETUP = !GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_');

function decodeJwt(token) {
  try {
    const b = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(b))));
  } catch (e) { return null; }
}

function CenterCard({ children }) {
  return (
    <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="panel" style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        {children}
      </div>
    </div>
  );
}

function LoginScreen({ onCredential, onDevLogin }) {
  const ref = useRef(null);
  useEffect(() => {
    if (NEEDS_SETUP) return;
    let tries = 0;
    const t = setInterval(() => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        clearInterval(t);
        window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (r) => onCredential(r.credential) });
        if (ref.current) window.google.accounts.id.renderButton(ref.current, { theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'center' });
      } else if (++tries > 50) { clearInterval(t); }
    }, 100);
    return () => clearInterval(t);
  }, []);
  return (
    <CenterCard>
      <div style={{ fontSize: 34, color: 'var(--neon)', textShadow: '0 0 18px var(--neon)' }}>⚙</div>
      <h2 style={{ color: 'var(--neon)', margin: '8px 0 4px', fontSize: 18 }}>broodev · admin</h2>
      <p className="muted" style={{ fontSize: 12, marginTop: 0 }}>관리자 전용 — Google 계정으로 로그인</p>
      {NEEDS_SETUP ? (
        <div style={{ textAlign: 'left', marginTop: 14 }}>
          <div className="mock-note"><b>⚠ 설정 필요</b><span>Google OAuth 클라이언트 ID가 아직 설정되지 않았습니다.</span></div>
          <ol className="muted" style={{ fontSize: 11.5, lineHeight: 1.7, paddingLeft: 18, margin: '0 0 10px' }}>
            <li>Google Cloud Console → 사용자 인증 정보 → OAuth 클라이언트 ID 생성</li>
            <li>승인된 JS 원본에 <span className="kbd">https://admin.broodev.com</span> 등록</li>
            <li>발급된 ID를 <span className="kbd">app.jsx</span> 의 GOOGLE_CLIENT_ID에 입력</li>
          </ol>
          <button className="btn ghost block" onClick={onDevLogin}>개발용으로 콘솔 미리보기 →</button>
        </div>
      ) : (
        <div ref={ref} style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }} />
      )}
      <p className="muted" style={{ fontSize: 10, marginTop: 16 }}>회원가입 없음 · 허용 계정만 접근</p>
    </CenterCard>
  );
}

function DeniedScreen({ user, onSignOut }) {
  return (
    <CenterCard>
      <div style={{ fontSize: 30, color: 'var(--crit)' }}>✕</div>
      <h2 style={{ color: 'var(--crit)', margin: '8px 0 4px', fontSize: 18 }}>접근 권한 없음</h2>
      <p className="muted" style={{ fontSize: 12 }}><b>{user.email}</b> 계정은 이 콘솔에 접근할 수 없습니다.</p>
      <button className="btn ghost block" style={{ marginTop: 12 }} onClick={onSignOut}>다른 계정으로 로그인</button>
    </CenterCard>
  );
}

function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const onCredential = (cred) => { const p = decodeJwt(cred); if (p && p.email) setUser({ email: p.email, name: p.name, picture: p.picture }); };
  const onDevLogin = () => setUser({ email: ALLOWED_EMAIL, name: '관리자 (개발)', picture: null, dev: true });
  const signOut = () => { try { window.google && window.google.accounts && window.google.accounts.id.disableAutoSelect(); } catch (e) {} setUser(null); };
  if (!user) return <LoginScreen onCredential={onCredential} onDevLogin={onDevLogin} />;
  if (user.email !== ALLOWED_EMAIL) return <DeniedScreen user={user} onSignOut={signOut} />;
  return children(user, signOut);
}

function UserChip({ user, onSignOut }) {
  return (
    <span className="row" style={{ gap: 8 }}>
      {user.picture
        ? <img src={user.picture} alt="" referrerPolicy="no-referrer" style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--line)' }} />
        : <span style={{ width: 24, height: 24, borderRadius: '50%', border: '1px solid var(--line)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neon)', fontSize: 12 }}>{(user.name || 'A')[0]}</span>}
      <span className="muted" style={{ fontSize: 11, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}{user.dev ? ' (dev)' : ''}</span>
      <button className="chip" onClick={onSignOut}>로그아웃</button>
    </span>
  );
}

/* ---- 관리자 셸 --------------------------------------------------------- */
function AdminApp({ user, onSignOut }) {
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
              <UserChip user={user} onSignOut={onSignOut} />
              <Clock />
            </div>
          </header>
          <div className="content"><Section go={go} user={user} /></div>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthGate>{(user, signOut) => <AdminApp user={user} onSignOut={signOut} />}</AuthGate>
);
