# broodev 설계서 & 신규 서브도메인 앱 플레이북

> broodev 포트폴리오(broodev.com + 서브도메인 앱들)를 만들며 쌓인 모든 결정·관행·함정을 정리한 문서.
> **Part 1** = 지금까지의 설계 총정리 / **Part 2** = 다음 앱 만들 때 그대로 따라갈 체크리스트.

---

## Part 1 — broodev 설계서 (총정리)

### 0. TL;DR (핵심 원칙 10가지)
1. **무빌드 정적**: CDN React 18 UMD + `@babel/standalone@7`(반드시 **@7 고정**) + 인라인 `<script type="text/babel">`. 빌드 단계 없음.
2. **모노레포 1앱 = 1 Cloudflare Pages 프로젝트 = 1 서브도메인.**
3. **13개 언어 i18n** 기본 탑재(en, ko, ja, zh, zh-Hant, th, es, fr, de, it, pt, ru, nl).
4. **SEO 정적 콘텐츠는 `#root` 바깥**에 둔다(React가 `#root`를 갈아끼우므로).
5. **파비콘·robots·sitemap·ads.txt는 실제 파일**로. `data:` URI 파비콘은 구글 검색결과에 안 뜬다.
6. **광고판(색인·광고) ↔ 프리미엄(noindex·광고 제거)** 2버전 구조.
7. **AdSense pub ID = `ca-pub-5511225478572825`** (계정과 반드시 일치). 인증 메타 + ads.txt + Auto Ads.
8. **AdSense 정책**: 자동 새로고침·강제 시청 게이팅·스팸 양산 **금지**.
9. **커밋/푸시는 사용자가 명시적으로 지시할 때만.** master push = 프로덕션 자동 배포.
10. **React 훅 규칙 엄수**(조건부 early-return 뒤에 훅 두지 말 것) — 첫 로드 백지 사고의 원인.

### 1. 아키텍처 / 기술 스택
- **모노레포 레이아웃**
  ```
  broodev/
    apps/
      web/    → broodev.com        (포털, 색인 O, 광고 O 예정)
      btc/    → btc.broodev.com     (앱, 광고판)
        member/   → /member/  (유료·광고없음·noindex)
        adsense/  → /adsense/ (구 광고버전, 고아 — 정리 대상 기술부채)
        functions/_middleware.js    (Cloudflare Pages Function: ?lang OG 현지화)
      admin/  → admin.broodev.com   (비공개 콘솔, Google SSO, robots Disallow)
    packages/ui-terminal/  → 공유 테마(theme.css)
    docs/                  → 본 문서
    README.md
  ```
- **무빌드 정적**: 각 앱은 정적 파일만. `<script type="text/babel" data-presets="react">`로 브라우저에서 JSX 컴파일.
  - React/ReactDOM UMD(production.min) + `@babel/standalone@7/babel.min.js`를 CDN(unpkg)에서 로드.
  - ⚠️ **Babel은 반드시 `@7` 고정.** 버전 안 박으면 v8로 자동 업그레이드 → 전 앱 검은 화면.
- **두 가지 앱 구성 패턴**
  - **자기완결형(btc)**: `index.html` 하나에 스타일·i18n·로직 전부 인라인. 단일 파일 앱에 적합.
  - **분리형(web/admin)**: `index.html` + `app.jsx` + `theme.css` + `i18n.js`(코어) + `i18n/<lang>.js`(언어별). 규모 커지면 이쪽.
- **상태/훅**: `useLocalStorage`(설정 영속), `useState`/`useEffect`/`useMemo`/`useRef` 표준. 데이터는 클라이언트 페치 + 캐시 하이드레이션 + 폴링.

### 2. 디자인 시스템 (packages/ui-terminal)
- **터미널 미학**: 다크 배경(`#05080a`), 네온 그린 액센트(`--neon: #00ff9c`), 스캔라인, 비네트, 매트릭스 레인, 모노스페이스 폰트(JetBrains Mono / Share Tech Mono).
- CSS 변수로 테마: `--neon`, `--accent`, `--text`, `--dim`, `--panel`, `--line`, 상태색 `--ok/--warn/--crit`.
- 전역 `* { box-sizing: border-box }`.
- **반응형**: 데스크톱 그리드 → 모바일 1열. ⚠️ 그리드 컬럼은 `minmax(0, 1fr)` + 패널 `min-width:0`(안 그러면 광고/긴 콘텐츠가 컬럼을 밀어 모바일 우측 잘림).
- 공통 셸 구조: `.app > .shell`(max-width 중앙정렬) + 좌우 거터(넓은 화면 광고 레일 배치 공간).

### 3. i18n (13개 언어)
- **언어**: `en, ko, ja, zh, zh-Hant, th, es, fr, de, it, pt, ru, nl`. 우측 상단 🌐 드롭다운.
- **detectLang 우선순위**: `localStorage` → URL `?lang=` → `navigator.language` → (zh-Hant 라우팅) → `en` 폴백.
- **두 구성**:
  - btc: 인라인 `T`(메인 번들) + 기능별 보조(`MODE_I18N`, `GATE_I18N`) + `seo-i18n.js`(하단 SEO 13언어).
  - web/admin: `i18n/<lang>.js` 파일 + `i18n.js` 코어. `window.__WEB`/`window.__ADMIN` 등 전역으로 읽음.
- **누락 키 = en 폴백** 항상 보장(`(MAP[lang] || MAP.en)`).
- **hreflang**: head에 `<link rel="alternate" hreflang="xx" href="...?lang=xx">` 13개.
- **OG/공유 썸네일 현지화**: `functions/_middleware.js`(Cloudflare Pages Function)에서 HTMLRewriter로 `?lang`별 OG meta 치환. 언어별 OG 이미지(og-ko/en/ja…) 준비.
- **UI 함정**: 긴 언어(독일어 `Antizyklisch` 등)에서 라벨이 버튼 폭을 넘김 → **라벨을 분리**(주 단어 크게 + 부가어 아주 작게)하거나 단어 1개로. 13개 언어를 **실제 폭으로 시각 검증**할 것(정적 CSS 하니스 스크린샷).
- **기본값 리셋**: 영속된 사용자 선택을 무시하고 새 기본값을 강제하려면 **localStorage 키를 bump**(`btc:mode`→`btc:mode2`).

### 4. SEO
- **정적 크롤러 콘텐츠**: `#root`는 React가 마운트 시 통째로 교체 → **크롤러용 본문은 `#root` 바깥**의 `<section class="seo">`에 둔다(순수 HTML, `class=`로 작성해 React `className`과 구분). 여기에 키워드 풍부한 설명·FAQ를 넣어야 색인됨.
- **head 필수**: 키워드 포함 `<title>`, `meta description`(120~155자), `meta keywords`, `robots: index, follow`, `canonical`, `theme-color`, OG 태그.
- **구조화 데이터(JSON-LD)**: `WebApplication`/`SoftwareApplication`(무료=`offers price 0`, `isAccessibleForFree`), `FAQPage`(방문 FAQ와 **반드시 텍스트 일치**), 포털은 `Organization`+`WebSite`. 추가 후 **JSON 파싱 검증**(깨지면 무효).
- **파일**: `sitemap.xml`(+`lastmod` 신선도) / `robots.txt`(+Sitemap 선언) **각 도메인마다**. SPA라 파일 없으면 SPA가 index.html을 반환하므로 **실제 파일 필수**.
- **파비콘**: `favicon.ico`(16/32/48 멀티사이즈) + `favicon.svg` + `favicon-96x96.png` + `apple-touch-icon.png`. ⚠️ **`data:` URI 파비콘은 구글 검색결과에서 무시됨** — 실제 파일 + `/favicon.ico` 필수. 검색결과 반영은 구글 재크롤 후 며칠~몇 주.
- **검색엔진 등록**: Google Search Console(도메인 속성 = Cloudflare DNS TXT 인증) + Naver Search Advisor(HTML meta 인증). 사이트맵 제출 + URL 검사로 색인 재요청.
- **⚠️ Core Web Vitals 한계**: 브라우저 Babel 컴파일(250KB 인라인 + CDN 의존)은 **LCP가 느림** → 순위·UX 불리. 근본 개선은 **빌드 단계 도입**(무빌드 철학과 트레이드오프) — 별도 결정 사안.
- **현실 인식**: 신생 도메인 + 경쟁 키워드 + AI 개요(상단 점유) = 빠른 1위 없음. 온페이지는 금방 끝나고, 순위는 **백링크 + 콘텐츠 누적 + 시간**.

### 5. AdSense / 수익화
- **계정**: pub ID `ca-pub-5511225478572825`. (과거 `2639…`는 오기 — 계정과 불일치하면 광고 안 뜸. 반드시 일치.)
- **연결 3종**(광고 게재 도메인에만):
  1. 인증 메타: `<meta name="google-adsense-account" content="ca-pub-5511225478572825">` (head)
  2. `ads.txt`: `google.com, pub-5511225478572825, DIRECT, f08c47fec0942fa0` (도메인 루트)
  3. Auto Ads 스크립트: `adsbygoogle.js?client=ca-pub-5511225478572825` (head, async)
- **수동 광고 단위**: `<ins class="adsbygoogle" data-ad-client data-ad-slot data-ad-format>`. **슬롯ID는 승인 후 AdSense에서 생성해 채움**(그 전엔 빈칸). 광고는 `#root` 바깥 본문/거터에 둬야 React 렌더에 안 지워짐.
- **광고판 ↔ 프리미엄**: 광고판(루트, 색인·광고) / 프리미엄(`member/`, **광고·게이트 전무 + noindex**). 프리미엄엔 AdSense 태그를 **하나도** 넣지 않는다.
- **CMP(GDPR)**: EEA·영국·스위스 트래픽이 있으면 Google CMP **3버튼(동의/동의안함/옵션관리)** 사용(거부 버튼 의무화 대응). 코드 불필요, AdSense에서 생성·게시.
- **승인 절차**: 연결 후 **사이트 심사 승인**(신규 며칠~몇 주)이 끝나야 광고 노출. 승인 전 "안 뜸"은 정상.
- **🚫 정책 금지**(계정 정지 사유):
  - 타이머 **자동 새로고침/로테이션**(노출수 부풀리기 = invalid traffic).
  - **강제 광고 시청 게이팅**(보상형 강제). "계산 대기 중 자연 노출"은 OK, "광고 봐야 잠금해제"는 NO.
  - AdSense 취득용 **스팸 앱 양산** 금지.

### 6. 배포 / 운영 규칙
- **Cloudflare Pages**: 1앱=1프로젝트, 빌드 커맨드 없음(정적), 출력 디렉터리 = 앱 폴더. 커스텀 도메인 연결 시 DNS는 **CNAME, DNS-only(회색 구름)**.
- **레포는 PUBLIC 유지**(pub ID·AdSense 코드는 공개돼도 안전).
- **master push = 프로덕션 자동 배포.** 그러므로 **커밋/푸시는 사용자가 명시적으로 지시할 때만**(`[[no-auto-commit-push]]`). 평소엔 로컬 수정 → 보고 → 대기.
- 커밋 메시지 끝에 `Co-Authored-By` 푸터.

### 7. 하지 말 것 / 함정 (hard-won lessons)
| 함정 | 결과 | 대응 |
|---|---|---|
| Babel 버전 미고정 | v8 자동 업글 → 전 앱 검은 화면 | `@babel/standalone@7` 고정 |
| 조건부 early-return **뒤에** 훅 배치 | "이전보다 훅 많음" 오류 → 첫 로드 백지(새로고침해야 뜸) | early-return 전에 모든 훅 호출 |
| `data:` URI 파비콘 | 구글 검색결과에 안 뜸 | 실제 `favicon.ico`/svg/png |
| pub ID 불일치 | 광고 안 뜸/인증 실패 | 실제 계정 ID와 일치 |
| 그리드 `1fr`(=minmax(auto,1fr)) | 광고/긴 콘텐츠가 모바일 우측 잘림 | `minmax(0,1fr)` + `min-width:0` |
| robots/sitemap/favicon 파일 없음 | SPA가 index.html 반환(404 아님) | 실제 정적 파일 배치 |
| 긴 언어 라벨 | 버튼 깨짐 | 라벨 분리/축소 + 13언어 시각 검증 |
| 자동 커밋/푸시 | 내 버그가 프로덕션 직행 | 사용자 지시 시에만 |

### 8. 검증 방법 (제약과 대안)
- ⚠️ **헤드리스 Edge는 이 앱의 React를 렌더 못 함**(CDN React/Babel 미실행). `--dump-dom`은 인라인 스크립트 **소스**만 잡힘 → 렌더 검증 무효.
- **대안**:
  - CSS/레이아웃: **정적 HTML 하니스**(앱과 동일 CSS + 실제 텍스트)를 만들어 `--headless --screenshot` → 이미지 확인(13언어 오버플로 등).
  - 구조화 데이터: JSON-LD 추출 후 `ConvertFrom-Json` 파싱 검증.
  - 라이브/배포: `Invoke-WebRequest`로 HTTP 200·Content-Type·헤더·정적 콘텐츠·robots 확인.
  - JS 문법: 인라인 문자열 **이스케이프 안 된 따옴표** 정적 스캔(`[a-z]'[a-z]`).
- 헤드리스 락: 직전 프로세스가 user-data-dir 잠그면 실패 → `Stop-Process msedge` 후 재시도. 작은 창 캡처는 `--virtual-time-budget`로 페인트 대기.

---

## Part 2 — 신규 서브도메인 앱 체크리스트

> 새 `<app>.broodev.com` 앱을 만들 때 순서대로. (■ = 필수, □ = 권장/선택)

### A. 기획 / 스코프
- ■ **단일 목적 + 실사용 가치**(스팸 앱 X). AdSense 승인·SEO의 전제.
- ■ 광고판 ↔ 프리미엄(있다면) 분리 여부 결정.
- □ 자기완결형(단일 index.html) vs 분리형(app.jsx+i18n 폴더) 선택 — 규모 기준.
- □ 타깃 키워드/롱테일 리서치(경쟁 강도, AI 개요 점유 여부).

### B. 스캐폴드
- ■ `apps/<app>/` 생성, `packages/ui-terminal/theme.css` 재사용(터미널 미학 일관성).
- ■ React18 UMD + **`@babel/standalone@7`(고정)** + 인라인 babel 스크립트.
- ■ 전역 `box-sizing:border-box`, 반응형 그리드 `minmax(0,1fr)` + `min-width:0`.
- ■ 셸 구조 `.app > .shell`(max-width 중앙) + 거터(광고 레일용).
- ■ **React 훅 규칙**: 모든 훅을 early-return/조건 분기 **앞**에 둔다. 로딩/게이트 화면도 훅 이후 분기 금지.

### C. i18n (13개 언어)
- ■ 언어 13종 + 🌐 드롭다운 + `detectLang`(localStorage→?lang→navigator→en).
- ■ 누락 키 **en 폴백** 보장.
- ■ head **hreflang 13개** alternate.
- ■ 모든 텍스트 13언어 번역(밴드/조언/FAQ/UI). 새 문자열 추가 시 13개 동시.
- ■ **긴 언어 오버플로 시각 검증**(정적 하니스 스크린샷). de/fr/nl/ru 주의.
- □ 공유 OG 현지화 → `functions/_middleware.js`(HTMLRewriter) + 언어별 OG 이미지.

### D. SEO
- ■ `<title>`(키워드) / `meta description`(120~155자) / keywords / `robots: index,follow` / `canonical` / OG.
- ■ **`#root` 바깥 정적 `<section class="seo">`**: 키워드 풍부한 본문 + FAQ(크롤러용).
- ■ JSON-LD: `WebApplication`(+무료 offer) + `FAQPage`(방문 FAQ와 **텍스트 일치**). 추가 후 **파싱 검증**.
- ■ `sitemap.xml`(+`lastmod`) + `robots.txt`(+Sitemap 선언) — **실제 파일**.
- ■ **파비콘 4종**(`favicon.ico` 16/32/48 + svg + 96png + apple-touch). `data:` URI 금지.
- □ 배포 후: GSC 도메인 인증 + 사이트맵 제출 + URL 색인 요청, Naver 등록.

### E. AdSense / 수익화 (광고판일 때)
- ■ pub ID **`ca-pub-5511225478572825`** 일관 사용.
- ■ head에 **인증 메타** + **Auto Ads 스크립트**(async).
- ■ 루트에 **`ads.txt`** (`google.com, pub-5511225478572825, DIRECT, f08c47fec0942fa0`).
- ■ 광고는 `#root` 바깥(본문/거터). 수동 단위 슬롯ID는 **승인 후** 채움.
- ■ 프리미엄 버전이 있으면 **AdSense 태그 전무 + noindex**.
- ■ **CMP(GDPR) 3버튼** 설정(EEA/UK/CH 트래픽 대비).
- ■ 🚫 자동 새로고침 / 강제 시청 게이팅 / 스팸 금지.
- □ 신규 도메인은 AdSense **사이트 추가 → 심사 승인** 대기(며칠~몇 주).

### F. 배포 (Cloudflare Pages)
- ■ 새 Pages 프로젝트 = `apps/<app>`, 빌드 커맨드 없음.
- ■ 커스텀 도메인 `<app>.broodev.com`, DNS **CNAME / DNS-only(회색 구름)**.
- ■ 포털(web)에서 새 앱으로 **내부 링크**(권위 전달) + web `sitemap`/"유용한 앱" 테이블에 추가.
- ■ **푸시는 사용자 지시 시에만**(master = 프로덕션).

### G. 사후 / 검증
- ■ 라이브 fetch로 200·robots·favicon·정적 SEO 콘텐츠·ads.txt 확인.
- ■ 13언어 렌더(최소 de/ja/ru) 시각 확인.
- ■ GSC/Naver 색인 요청, AdSense 연결 "확인".
- □ Core Web Vitals 측정(LCP). 느리면 빌드 단계 도입 검토.

---

### 부록 — 알려진 기술부채 / TODO
- `apps/btc/adsense/` 고아 폴더(구 광고버전, 어디서도 링크 안 됨, canonical은 루트) — 삭제 또는 정리 대상.
- 무빌드 Babel-in-browser의 LCP 부담 — 성장 시 빌드 파이프라인(Vite/esbuild) 전환 검토(아키텍처 결정 사안).
- 수동 광고 단위 `data-ad-slot` 빈칸 — 승인 후 채울 것.
