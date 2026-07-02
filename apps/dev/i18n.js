/* broodev.com i18n 코어. ko 원본을 담고, 나머지 언어는 i18n/<lang>.js 가 window.__WEB 에 등록.
   index.html 에서 i18n/<lang>.js 들 + 이 파일을 로드 → app.jsx 가 window.WEB_I18N 사용. */
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

  // ko 원본 (i18n/<lang>.js 가 채우는 다른 언어와 동일 구조)
  var KO = {
    tagline: '쓸모있는 웹앱을, 무료로.',
    nav: { about: '회사 소개', apps: '유용한 앱들', news: '소식', membership: '멤버십', contact: '문의', privacy: '개인정보처리방침', terms: '이용약관' },
    grp: { company: '회사', more: '더보기', policy: '정책' },
    foot: '모든 앱 무료 · 광고로 운영', mock: '목업',
    st: { live: 'live', beta: 'beta', soon: '예정' },
    about: {
      lead: '설치 없이 브라우저에서 바로 쓰는, 일상에 도움 되는 무료 웹앱들을 한곳에 모았습니다.',
      btnApps: '▦ 유용한 앱들 보기', btnContact: '✉ 문의하기',
      doingH: '우리가 하는 일',
      doingP: '는 “양보다 질”을 원칙으로, 실제로 쓸모 있는 웹앱을 만들어 무료로 제공합니다. 모든 앱은 광고(Google AdSense)로 운영되어 누구나 비용 없이 사용할 수 있습니다.',
      featH: 'broodev 앱의 특징',
      feats: [
        { k: '설치 불필요', v: '브라우저로 즉시', sub: '앱 설치·가입 없이 링크 하나로 실행' },
        { k: '실시간 데이터', v: '공개 API 합성', sub: '신뢰할 수 있는 출처에서 실시간 수집' },
        { k: '다국어 · 모바일', v: '어디서나', sub: '여러 언어 지원 + 반응형 모바일 대응' },
        { k: '투명함', v: '참고용 명시', sub: '데이터 출처·한계를 분명히 안내' }
      ],
      repH: '대표 앱', repDesc: '비트코인 공포·탐욕 지수 & 매수 타이밍 점수',
      infoH: '회사 정보', opLabel: '운영', ceoLabel: '대표', contactLabel: '문의', biz: '사업자 정보: 준비 중',
      foot: '모든 앱은 참고용 도구이며, 이용에 따른 판단과 책임은 이용자 본인에게 있습니다.'
    },
    apps: {
      title: '유용한 앱들', descTpl: '출시 {a}개 · 준비 중 {b}개', search: '앱 검색 (이름·설명·카테고리)',
      thApp: '앱', thDesc: '설명', thCat: '카테고리', thStatus: '상태', thLink: '링크',
      empty: '검색 결과가 없습니다.', soonCell: '준비 중', pageTpl: '{a} / {b} 페이지',
      note: '※ “예정” 앱은 출시 준비 중입니다. 출시되면 클릭해 바로 이동할 수 있어요.'
    },
    news: {
      title: '소식', desc: 'broodev 공지 · 업데이트', mock: '실제 피드 연동 전까지 예시 데이터입니다.',
      items: [
        { tag: '런칭', title: 'broodev 포털 오픈', body: '여러 무료 웹앱을 한곳에 모은 broodev 포털을 공개했습니다.' },
        { tag: '업데이트', title: 'BTC_SIGNAL 13개 언어 지원', body: '비트코인 공포·탐욕 지수 앱이 다국어와 모바일 대응을 마쳤습니다.' }
      ]
    },
    mem: {
      title: '멤버십', desc: '광고 없는 broodev — 평생 회원', mock: '결제는 아직 연동되지 않았습니다(가격·버튼 비활성). 화면 구성만 미리보기.',
      freeName: 'Free', freeCta: '지금 사용 중', freeFeats: ['모든 앱 무료 사용', '광고 표시', '커뮤니티 지원'],
      lifeName: 'Lifetime', lifeCta: '준비 중', lifeFeats: ['광고 완전 제거', '평생 1회 결제', '신규 앱 우선 이용']
    },
    contact: {
      title: '문의', desc: '제휴 · 버그 · 제안 무엇이든', mock: '전송 버튼은 메일 앱을 여는 mailto 폴백입니다. 서버 전송은 추후 연동.',
      lblName: '이름', lblEmail: '회신 이메일', lblMsg: '내용', btn: '✉ 보내기', sent: '메일 앱이 열리지 않으면 아래 주소로 보내주세요:'
    },
    privacy: {
      title: '개인정보처리방침', eff: '시행일', op: '운영',
      intro: 'broodev(이하 “사이트”)는 회원가입이 없으며 이용자의 개인정보를 직접 수집·저장하지 않습니다. 다만 광고 및 서비스 운영을 위해 아래와 같이 쿠키가 사용될 수 있습니다.',
      s: [
        { h: '1. 쿠키와 광고 (Google AdSense)', p: '본 사이트는 Google AdSense를 통해 광고를 게재합니다. Google 등 제3자 공급업체는 쿠키로 이용자의 이전 방문 기록을 바탕으로 광고를 제공할 수 있습니다. Google 광고 설정에서 맞춤 광고를 비활성화할 수 있습니다.' },
        { h: '2. 분석', p: '서비스 개선을 위해 익명화된 트래픽 통계가 수집될 수 있으며, 개인을 식별하지 않습니다.' },
        { h: '3. 로컬 저장소', p: '언어·테마 등 설정은 이용자 브라우저(localStorage)에만 저장되며 서버로 전송되지 않습니다.' },
        { h: '4. 제3자 링크', p: '외부 링크 이동 후의 개인정보 처리는 해당 사이트 방침을 따릅니다.' },
        { h: '5. 아동의 개인정보', p: '본 사이트는 만 14세 미만 아동을 대상으로 하지 않습니다.' },
        { h: '6. 방침 변경', p: '본 방침은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.' },
        { h: '7. 문의', p: '개인정보 관련 문의:' }
      ]
    },
    terms: {
      title: '이용약관', eff: '시행일', op: '운영',
      a: [
        { h: '제1조 (목적)', p: '본 약관은 broodev가 제공하는 웹앱 서비스의 이용 조건을 규정합니다.' },
        { h: '제2조 (서비스)', p: '모든 앱은 무료로 제공되며, 데이터·점수·결과는 참고용입니다. 정확성·완전성을 보장하지 않습니다.' },
        { h: '제3조 (면책)', p: '특히 금융 앱(예: BTC_SIGNAL)의 수치는 투자 자문이 아니며, 모든 판단과 책임은 이용자 본인에게 있습니다.' },
        { h: '제4조 (지식재산권)', p: '사이트 및 앱의 콘텐츠·디자인 권리는 운영자에게 있습니다.' },
        { h: '제5조 (약관 변경)', p: '약관은 변경될 수 있으며, 변경 시 본 페이지에 게시합니다.' },
        { h: '제6조 (문의)', p: '문의:' }
      ]
    }
  };

  function getT(lang) {
    if (lang === 'ko') return KO;
    var w = window.__WEB || {};
    return w[lang] || w.en || KO;
  }
  window.WEB_I18N = { LANGS: LANGS, detectLang: detectLang, getT: getT, fmt: fmt, has: has };
})();
