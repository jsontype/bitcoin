/* admin.broodev.com i18n 코어. ko 원본 + i18n/<lang>.js(window.__ADMIN). */
(function () {
  var LANGS = [
    { code: 'en', label: 'English' }, { code: 'ja', label: '日本語' }, { code: 'ko', label: '한국어' },
    { code: 'zh', label: '简体中文' }, { code: 'zh-Hant', label: '繁體中文' }, { code: 'th', label: 'ไทย' },
    { code: 'es', label: 'Español' }, { code: 'fr', label: 'Français' }, { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' }, { code: 'pt', label: 'Português' }, { code: 'ru', label: 'Русский' },
    { code: 'nl', label: 'Nederlands' }
  ];
  function has(c) { for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === c) return true; return false; }
  function detectLang() {
    try {
      var s = localStorage.getItem('broodev:lang'); if (s && has(s)) return s;
      var q = new URLSearchParams(location.search).get('lang'); if (q && has(q)) return q;
      var n = navigator.language || 'en';
      if (n.toLowerCase().indexOf('zh') === 0 && /(TW|HK|Hant)/i.test(n)) return 'zh-Hant';
      var b = n.toLowerCase().split('-')[0];
      if (has(b)) return b;
      return 'en';
    } catch (e) { return 'en'; }
  }
  function fmt(s, o) { s = String(s == null ? '' : s); if (o) for (var k in o) s = s.split('{' + k + '}').join(o[k]); return s; }

  var KO = {
    nav: { dashboard: '대시보드', apps: '앱', collect: '데이터 수집', queries: '조회 / 로그', analytics: '애널리틱스', terminal: '터미널', settings: '설정' },
    grp: { ops: '운영', data: '데이터', tools: '도구' },
    foot: '운영 콘솔 · 내부용', online: 'ONLINE', logout: '로그아웃', admin: '관리자', mock: '목업',
    sso: {
      sub: '관리자 전용 — Google 계정으로 로그인', setup: 'Google OAuth 클라이언트 ID가 아직 설정되지 않았습니다.',
      step1: 'Google Cloud Console → 사용자 인증 정보 → OAuth 클라이언트 ID 생성', step2b: '승인된 JS 원본에', step2a: '등록',
      step3a: '발급된 ID를', step3b: '의 GOOGLE_CLIENT_ID에 입력', devLogin: '개발용으로 콘솔 미리보기 →',
      noSignup: '회원가입 없음 · 허용 계정만 접근', deniedH: '접근 권한 없음', deniedP: '계정은 이 콘솔에 접근할 수 없습니다.', other: '다른 계정으로 로그인'
    },
    dash: {
      title: '대시보드', desc: 'broodev 운영 요약', mock: '지표·수익은 예시 값입니다. 실데이터는 백엔드 연동 후 표시됩니다.',
      cApps: '앱', cAppsSub: '운영 중', cJobs: '활성 수집 잡', cJobsSub: '1개 경고', cVisit: '오늘 방문', cVisitSub: '어제 대비 +30%', cRev: '추정 수익(월)', cRevSub: 'AdSense 연동 예정',
      recent: '최근 활동', collectStatus: '수집 상태', manageCollect: '수집 관리 →'
    },
    appsP: { title: '앱', desc: '등록된 broodev 앱', mock: '앱 등록/상태는 추후 백엔드와 동기화됩니다.', thApp: '앱', thDomain: '도메인', thJobs: '수집 잡', thSync: '최근 동기화', thStatus: '상태' },
    collect: { title: '데이터 수집', desc: '수집 잡 관리 · 수동 실행', mock: '“지금 수집”은 동작만 흉내냅니다. 실제 트리거는 백엔드 연동 시.', thId: '잡 ID', thApp: '앱', thSource: '소스', thSched: '주기', thLast: '최근', thStatus: '상태', run: '지금 수집', running: '실행 중…' },
    queries: { title: '조회 / 로그', desc: '수집 이벤트 로그', mock: '예시 로그입니다. 실제 조회는 수집 DB 연동 후.', allApps: '전체 앱', allLevels: '전체 레벨', thTime: '시각', thApp: '앱', thEvent: '이벤트', thDetail: '상세', empty: '결과 없음' },
    analytics: { title: '애널리틱스', desc: '트래픽 · 수익', mock: '방문·수익은 예시 값입니다. GA4 / AdSense API 연동 예정.', c7d: '7일 방문', cDwell: '평균 체류', cRpm: '추정 RPM', cRpmSub: 'AdSense 연동 후', visits7d: '최근 7일 방문' },
    term: { title: '터미널', desc: '운영 명령 콘솔', note: '※ collect 등 실제 동작은 백엔드 연동 후입니다. 지금은 목업 응답.' },
    settings: {
      title: '설정', desc: '일반 · 연동 · 테마', mock: '저장은 아직 서버에 반영되지 않습니다(화면용).',
      general: '일반', siteName: '사이트 이름', opEmail: '운영자 이메일', integ: '연동 (API 키)', notiTheme: '알림 / 테마',
      notiToggle: '수집 실패 시 이메일 알림', themeColor: '테마 강조색', save: '저장', saved: '✓ 저장됨 (목업)',
      danger: '위험 구역', dangerP: '캐시/수집 데이터를 초기화합니다. (목업 — 동작 안 함)', dangerBtn: '수집 캐시 비우기'
    }
  };

  function getT(lang) { if (lang === 'ko') return KO; var w = window.__ADMIN || {}; return w[lang] || w.en || KO; }
  window.ADMIN_I18N = { LANGS: LANGS, detectLang: detectLang, getT: getT, fmt: fmt, has: has };
})();
