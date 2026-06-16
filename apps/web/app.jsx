/* =============================================================================
   broodev.com — 회사 포털 (사이드바 SPA · 해시 라우팅 · 빌드 불필요)
   - 기본 랜딩: 회사 소개(#/about)
   - 사이드바 "유용한 앱들"(#/apps): 전체 앱 목록 (페이지네이션 테이블) — #5
   - 그 외 통상 부모도메인 기능(소식/멤버십/문의/약관) — #6 (목업, ***! TODO 표기)
   ========================================================================== */
const { useState, useEffect, useCallback } = React;

/* ---- 회사 정보 ---------------------------------------------------------- */
const COMPANY = {
  name: 'broodev',
  operator: 'Y-Systems',
  ceo: 'jsontype',
  email: 'jsontyper@gmail.com',
  tagline: '쓸모있는 웹앱을, 무료로.',
};

/* ---- 앱 카탈로그 (유용한 앱들 목록의 원본) -------------------------------
   새 앱을 추가하면 #/apps 목록에 자동 반영된다. (#5에서 테이블로 렌더) */
const APPS = [
  {
    slug: 'btc', name: 'BTC_SIGNAL', url: 'https://btc.broodev.com',
    category: '금융', status: 'live',
    desc: '비트코인 공포·탐욕 지수와 6개 지표를 합성한 매수 타이밍 점수(0~100).',
    tags: ['비트코인', '공포지수', '실시간'], since: '2026-06',
  },
];

/* ***! TODO: 아래 ROADMAP은 "예정" 표시용 플레이스홀더입니다.
   실제 앱을 출시하면 위 APPS(live)로 옮기고 여기서 제거하세요. */
const ROADMAP = [
  { slug: 'fx',    name: '환율 계산기',     category: '금융',   status: 'soon', desc: '실시간 환율로 즉시 변환하는 다통화 계산기.', tags: ['환율'] },
  { slug: 'dday',  name: 'D-Day 카운터',    category: '생활',   status: 'soon', desc: '기념일·마감까지 남은 날짜를 카운트.', tags: ['날짜'] },
  { slug: 'qr',    name: 'QR 생성기',       category: '도구',   status: 'soon', desc: '링크·텍스트를 QR 코드로 즉시 생성.', tags: ['QR'] },
  { slug: 'unit',  name: '단위 변환기',     category: '도구',   status: 'soon', desc: '길이·무게·온도 등 단위를 빠르게 변환.', tags: ['변환'] },
  { slug: 'color', name: '컬러 팔레트',     category: '디자인', status: 'soon', desc: '브랜드 컬러·팔레트 추출과 대비 검사.', tags: ['색상'] },
  { slug: 'json',  name: 'JSON 포매터',     category: '개발',   status: 'soon', desc: 'JSON 정렬·검증·트리 뷰.', tags: ['개발'] },
  { slug: 'timer', name: '포모도로 타이머', category: '생산성', status: 'soon', desc: '집중·휴식 사이클 타이머.', tags: ['타이머'] },
];

/* ---- 내비게이션 --------------------------------------------------------- */
const NAV = [
  { group: '회사', items: [
    { id: 'about', icon: '▸', label: '회사 소개' },
    { id: 'apps',  icon: '▦', label: '유용한 앱들' },
  ]},
  { group: '더보기', items: [
    { id: 'news',       icon: '✷', label: '소식' },
    { id: 'membership', icon: '★', label: '멤버십' },
    { id: 'contact',    icon: '✉', label: '문의' },
  ]},
  { group: '정책', items: [
    { id: 'privacy', icon: '§', label: '개인정보처리방침' },
    { id: 'terms',   icon: '§', label: '이용약관' },
  ]},
];
const FLAT_NAV = NAV.flatMap(g => g.items);

/* ---- 공용 훅/컴포넌트 --------------------------------------------------- */
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

/* ---- 회사 소개 (기본 랜딩) --------------------------------------------- */
function AboutPage({ go }) {
  return (
    <div className="prose">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
        <span style={{ fontSize: 40, color: 'var(--neon)', textShadow: '0 0 18px var(--neon)' }}>&gt;_</span>
        <h1 style={{ margin: 0 }}>brood<span className="muted">ev</span></h1>
      </div>
      <p className="lead">{COMPANY.tagline} 설치 없이 브라우저에서 바로 쓰는, 일상에 도움 되는 무료 웹앱들을 한곳에 모았습니다.</p>

      <div className="row" style={{ margin: '18px 0 8px' }}>
        <a className="btn" onClick={() => go('apps')}>▦ 유용한 앱들 보기</a>
        <a className="btn ghost" onClick={() => go('contact')}>✉ 문의하기</a>
      </div>

      <h2>우리가 하는 일</h2>
      <p>
        <strong>{COMPANY.operator}</strong>는 “양보다 질”을 원칙으로, 실제로 쓸모 있는 웹앱을 만들어 무료로 제공합니다.
        모든 앱은 광고(Google AdSense)로 운영되어 누구나 비용 없이 사용할 수 있습니다.
      </p>

      <h2>broodev 앱의 특징</h2>
      <div className="cards" style={{ margin: '12px 0' }}>
        <div className="card"><div className="k">설치 불필요</div><div className="v" style={{ fontSize: 18 }}>브라우저로 즉시</div><div className="sub">앱 설치·가입 없이 링크 하나로 실행</div></div>
        <div className="card"><div className="k">실시간 데이터</div><div className="v" style={{ fontSize: 18 }}>공개 API 합성</div><div className="sub">신뢰할 수 있는 출처에서 실시간 수집</div></div>
        <div className="card"><div className="k">다국어 · 모바일</div><div className="v" style={{ fontSize: 18 }}>어디서나</div><div className="sub">여러 언어 지원 + 반응형 모바일 대응</div></div>
        <div className="card"><div className="k">투명함</div><div className="v" style={{ fontSize: 18 }}>참고용 명시</div><div className="sub">데이터 출처·한계를 분명히 안내</div></div>
      </div>

      <h2>대표 앱</h2>
      <div className="table-wrap" style={{ margin: '12px 0' }}>
        <table className="tbl">
          <tbody>
            <tr className="clickable" onClick={() => window.open(APPS[0].url, '_blank', 'noopener')}>
              <td className="t-name">BTC_SIGNAL <span className="tag live">live</span></td>
              <td className="t-muted">비트코인 공포·탐욕 지수 &amp; 매수 타이밍 점수</td>
              <td style={{ textAlign: 'right' }} className="neon">btc.broodev.com ↗</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>회사 정보</h2>
      <ul>
        <li>운영: <strong>{COMPANY.operator}</strong> (대표 {COMPANY.ceo})</li>
        <li>문의: <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></li>
        {/* ***! TODO: 사업자등록번호·설립연도·주소 등 공식 회사 정보 확정 후 기재 */}
        <li className="muted">사업자 정보: 준비 중</li>
      </ul>

      <hr className="divider" />
      <p className="muted" style={{ fontSize: 12 }}>© {COMPANY.operator} · broodev — 모든 앱은 참고용 도구이며, 이용에 따른 판단과 책임은 이용자 본인에게 있습니다.</p>
    </div>
  );
}

/* ---- 유용한 앱들 (페이지네이션 테이블 · 행 클릭 → 서브도메인) ---------- */
function StatusTag({ status }) {
  if (status === 'live') return <span className="tag live">live</span>;
  if (status === 'beta') return <span className="tag beta">beta</span>;
  return <span className="tag soon">예정</span>;
}

function Pager({ page, pages, onGo }) {
  if (pages <= 1) return null;
  const nums = [];
  for (let i = 1; i <= pages; i++) nums.push(i);
  return (
    <div className="pager">
      <span className="pinfo">{page} / {pages} 페이지</span>
      <div className="pbtns">
        <button className="pbtn" disabled={page <= 1} onClick={() => onGo(page - 1)} aria-label="이전">‹</button>
        {nums.map(n => (
          <button key={n} className={'pbtn' + (n === page ? ' active' : '')} onClick={() => onGo(n)}>{n}</button>
        ))}
        <button className="pbtn" disabled={page >= pages} onClick={() => onGo(page + 1)} aria-label="다음">›</button>
      </div>
    </div>
  );
}

function AppsPage() {
  const ALL = [...APPS, ...ROADMAP];
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const ql = q.trim().toLowerCase();
  useEffect(() => { setPage(1); }, [ql]);

  const filtered = ALL.filter(a =>
    !ql || (a.name + a.desc + a.category + (a.tags || []).join(' ')).toLowerCase().includes(ql));
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * pageSize, cur * pageSize);
  const open = (a) => { if (a.status === 'live' && a.url) window.open(a.url, '_blank', 'noopener'); };

  return (
    <>
      <PageHead title="유용한 앱들" desc={`출시 ${APPS.length}개 · 준비 중 ${ROADMAP.length}개`} />
      <div className="row" style={{ marginBottom: 14 }}>
        <input className="input" placeholder="앱 검색 (이름·설명·카테고리)" value={q}
          onChange={e => setQ(e.target.value)} style={{ flex: 1, minWidth: 220 }} />
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead>
            <tr><th>앱</th><th>설명</th><th>카테고리</th><th>상태</th><th style={{ textAlign: 'right' }}>링크</th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5}><div className="empty">검색 결과가 없습니다.</div></td></tr>}
            {rows.map(a => (
              <tr key={a.slug} className={a.status === 'live' ? 'clickable' : ''}
                onClick={() => open(a)} title={a.status === 'live' ? a.url : '준비 중'}>
                <td className="t-name">{a.name}</td>
                <td className="t-muted">{a.desc}</td>
                <td className="t-muted">{a.category}</td>
                <td><StatusTag status={a.status} /></td>
                <td style={{ textAlign: 'right' }} className={a.status === 'live' ? 'neon' : 't-muted'}>
                  {a.status === 'live' ? a.url.replace('https://', '') + ' ↗' : '준비 중'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pager page={cur} pages={pages} onGo={setPage} />
      </div>
      <p className="muted" style={{ fontSize: 11, marginTop: 12 }}>※ “예정” 앱은 출시 준비 중입니다. 출시되면 클릭해 바로 이동할 수 있어요.</p>
    </>
  );
}

function MockNote({ children }) {
  return <div className="mock-note"><b>⚠ 목업</b><span>{children}</span></div>;
}

/* ---- 소식 (목업) ------------------------------------------------------- */
/* ***! TODO: 실제 공지/릴리스 노트를 CMS나 마크다운/JSON 피드로 연동. 지금은 하드코딩 목업. */
const NEWS = [
  { date: '2026-06-16', tag: '런칭', title: 'broodev 포털 오픈', body: '여러 무료 웹앱을 한곳에 모은 broodev 포털을 공개했습니다.' },
  { date: '2026-06-10', tag: '업데이트', title: 'BTC_SIGNAL 13개 언어 지원', body: '비트코인 공포·탐욕 지수 앱이 다국어와 모바일 대응을 마쳤습니다.' },
];
function NewsPage() {
  return (
    <>
      <PageHead title="소식" desc="broodev 공지 · 업데이트" />
      <MockNote>실제 피드 연동 전까지 예시 데이터입니다.</MockNote>
      <div className="stack">
        {NEWS.map((n, i) => (
          <div className="panel" key={i}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="tag beta">{n.tag}</span>
              <span className="muted" style={{ fontSize: 11 }}>{n.date}</span>
            </div>
            <h3 style={{ color: 'var(--text)', margin: '10px 0 4px', fontSize: 15 }}>{n.title}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 13 }}>{n.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- 멤버십 (목업) ----------------------------------------------------- */
/* ***! TODO: 결제(예: Stripe/토스/포트원) 연동 + 광고 제거 권한 처리. 지금은 화면만. */
function MembershipPage() {
  const plans = [
    { name: 'Free', price: '₩0', cta: '지금 사용 중', accent: false,
      feats: ['모든 앱 무료 사용', '광고 표시', '커뮤니티 지원'] },
    { name: 'Lifetime', price: '₩—', cta: '준비 중', accent: true,
      feats: ['광고 완전 제거', '평생 1회 결제', '신규 앱 우선 이용'] },
  ];
  return (
    <>
      <PageHead title="멤버십" desc="광고 없는 broodev — 평생 회원" />
      <MockNote>결제는 아직 연동되지 않았습니다(가격·버튼 비활성). 화면 구성만 미리보기.</MockNote>
      <div className="cards">
        {plans.map(p => (
          <div className="panel" key={p.name} style={p.accent ? { borderColor: 'var(--neon)', boxShadow: '0 0 30px -12px var(--neon)' } : null}>
            {p.accent && <><span className="corner tl" /><span className="corner br" /></>}
            <div className="panel-label">{p.name}</div>
            <div style={{ fontSize: 34, fontWeight: 800, color: p.accent ? 'var(--neon)' : 'var(--text)' }}>{p.price}</div>
            <ul style={{ margin: '12px 0', paddingLeft: 18, fontSize: 13, color: 'var(--dim)' }}>
              {p.feats.map((f, i) => <li key={i} style={{ margin: '5px 0' }}>{f}</li>)}
            </ul>
            <button className={'btn block' + (p.accent ? '' : ' ghost')} disabled={p.accent}>{p.cta}</button>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---- 문의 (목업) ------------------------------------------------------- */
/* ***! TODO: 폼 전송 백엔드(서버리스 함수/메일 API) 연동. 지금은 mailto 폴백만 동작. */
function ContactPage() {
  const [f, setF] = useState({ name: '', email: '', msg: '' });
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    const body = encodeURIComponent(`이름: ${f.name}\n회신: ${f.email}\n\n${f.msg}`);
    window.location.href = `mailto:${COMPANY.email}?subject=${encodeURIComponent('[broodev 문의] ' + f.name)}&body=${body}`;
    setSent(true);
  };
  return (
    <>
      <PageHead title="문의" desc="제휴 · 버그 · 제안 무엇이든" />
      <MockNote>전송 버튼은 메일 앱을 여는 mailto 폴백입니다. 서버 전송은 추후 연동.</MockNote>
      <form className="panel" style={{ maxWidth: 520 }} onSubmit={submit}>
        <div className="field"><label>이름</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} required /></div>
        <div className="field"><label>회신 이메일</label><input type="email" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required /></div>
        <div className="field"><label>내용</label><textarea value={f.msg} onChange={e => setF({ ...f, msg: e.target.value })} required /></div>
        <button className="btn block" type="submit">✉ 보내기</button>
        {sent && <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>메일 앱이 열리지 않으면 <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a> 로 보내주세요.</p>}
      </form>
    </>
  );
}

/* ---- 개인정보처리방침 (AdSense 승인용 실제 문서) ----------------------- */
/* ***! TODO: 사업자 정보 확정 후 시행일·운영자 법적 명칭 기재, 필요 시 법률 검토. */
function PrivacyPage() {
  return (
    <div className="prose">
      <h1>개인정보처리방침</h1>
      <p className="muted">시행일: 2026-06-16 · 운영: {COMPANY.operator}</p>
      <p>broodev(이하 “사이트”)는 회원가입이 없으며 이용자의 개인정보를 직접 수집·저장하지 않습니다. 다만 광고 및 서비스 운영을 위해 아래와 같이 쿠키가 사용될 수 있습니다.</p>
      <h2>1. 쿠키와 광고 (Google AdSense)</h2>
      <p>본 사이트는 Google AdSense를 통해 광고를 게재합니다. Google을 포함한 제3자 공급업체는 쿠키를 사용하여 이용자의 이전 방문 기록을 바탕으로 광고를 제공할 수 있습니다. 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener">Google 광고 설정</a>에서 맞춤 광고를 비활성화할 수 있습니다.</p>
      <h2>2. 분석</h2>
      <p>서비스 개선을 위해 익명화된 트래픽 통계가 수집될 수 있으며, 이는 개인을 식별하지 않습니다.</p>
      <h2>3. 로컬 저장소</h2>
      <p>언어·테마 등 사용자 설정은 이용자 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다.</p>
      <h2>4. 제3자 링크</h2>
      <p>사이트의 외부 링크로 이동한 뒤의 개인정보 처리는 해당 사이트의 방침을 따릅니다.</p>
      <h2>5. 아동의 개인정보</h2>
      <p>본 사이트는 만 14세 미만 아동을 대상으로 하지 않습니다.</p>
      <h2>6. 방침 변경</h2>
      <p>본 방침은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.</p>
      <h2>7. 문의</h2>
      <p>개인정보 관련 문의: <a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></p>
    </div>
  );
}

/* ---- 이용약관 ---------------------------------------------------------- */
/* ***! TODO: 사업자 정보·준거법 관할 확정 후 최종화, 필요 시 법률 검토. */
function TermsPage() {
  return (
    <div className="prose">
      <h1>이용약관</h1>
      <p className="muted">시행일: 2026-06-16 · 운영: {COMPANY.operator}</p>
      <h2>제1조 (목적)</h2>
      <p>본 약관은 broodev가 제공하는 웹앱 서비스의 이용 조건을 규정합니다.</p>
      <h2>제2조 (서비스)</h2>
      <p>사이트의 모든 앱은 무료로 제공되며, 데이터·점수·결과는 <strong>참고용</strong>입니다. 정확성·완전성을 보장하지 않습니다.</p>
      <h2>제3조 (면책)</h2>
      <p>특히 금융 관련 앱(예: BTC_SIGNAL)의 수치는 투자 자문이 아니며, 이용에 따른 모든 판단과 책임은 이용자 본인에게 있습니다.</p>
      <h2>제4조 (지식재산권)</h2>
      <p>사이트 및 앱의 콘텐츠·디자인에 대한 권리는 {COMPANY.operator}에 있습니다.</p>
      <h2>제5조 (약관 변경)</h2>
      <p>약관은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.</p>
      <h2>제6조 (문의)</h2>
      <p><a href={'mailto:' + COMPANY.email}>{COMPANY.email}</a></p>
    </div>
  );
}

const SECTIONS = {
  about: AboutPage, apps: AppsPage, news: NewsPage,
  membership: MembershipPage, contact: ContactPage, privacy: PrivacyPage, terms: TermsPage,
};

/* ---- 앱 셸 ------------------------------------------------------------- */
function App() {
  const [route, go] = useHashRoute('about');
  const [navOpen, setNavOpen] = useState(false);
  useEffect(() => { setNavOpen(false); }, [route]);
  const Section = SECTIONS[route] || AboutPage;
  const current = FLAT_NAV.find(n => n.id === route);

  return (
    <>
      <div className={'scrim' + (navOpen ? ' show' : '')} onClick={() => setNavOpen(false)} />
      <div className="layout">
        <aside className={'sidebar' + (navOpen ? ' open' : '')}>
          <div className="side-brand">
            <span className="side-logo">&gt;_</span>
            <span className="side-title">brood<span className="dim">ev</span></span>
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
          <div className="side-foot">© {COMPANY.operator} · broodev<br />모든 앱 무료 · 광고로 운영</div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="nav-toggle" onClick={() => setNavOpen(o => !o)} aria-label="메뉴">≡</button>
            <span className="topbar-title">{current ? current.label : 'broodev'}</span>
            <div className="topbar-right">
              <a className="chip" href="https://btc.broodev.com" target="_blank" rel="noopener">btc ↗</a>
              <Clock />
            </div>
          </header>
          <div className="content"><Section go={go} /></div>
        </main>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
