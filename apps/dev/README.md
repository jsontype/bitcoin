# web — broodev.com (회사 포털)

**기술 스택:** React 18 (CDN UMD) · 브라우저 Babel (빌드 불필요) · 해시 라우팅 SPA · 공통 `theme.css`(ui-terminal) · 정적 호스팅(Cloudflare Pages)

broodev 회사 소개 + 전체 앱을 소개하는 부모 도메인 포털입니다. 기본 랜딩은 **회사 소개**, 사이드바의 **유용한 앱들**에서 전체 앱을 페이지네이션 테이블로 제공합니다.

## 구성
- `index.html` — 메타/SEO/Organization JSON-LD + 폰트 + 정적 폴백(크롤러용) + React/Babel 로드
- `app.jsx` — 사이드바 SPA. `SECTIONS` 레지스트리 + `NAV` 메뉴 + 해시 라우팅
- `theme.css` — 공통 테마 사본 (원본: `packages/ui-terminal/theme.css`)
- `ads.txt` — AdSense (호스트 루트 게재)

## 메뉴
| 경로 | 내용 |
| --- | --- |
| `#/about` | 회사 소개 (기본) |
| `#/apps` | 유용한 앱들 — 페이지네이션 테이블, 행 클릭 시 서브도메인 이동 |
| `#/news` · `#/membership` · `#/contact` | 소식 · 멤버십 · 문의 (목업) |
| `#/privacy` · `#/terms` | 개인정보처리방침 · 이용약관 |

## 앱 추가
`app.jsx` 의 `APPS` 배열에 항목을 추가하면 “유용한 앱들” 목록에 자동 반영됩니다.

## 로컬 미리보기
빌드는 없지만 브라우저 Babel이 `app.jsx`를 fetch하므로 **정적 서버**가 필요합니다(`file://` 불가). VS Code Live Server 등을 쓰거나, Cloudflare Pages 프리뷰 배포로 확인하세요.

## 목업 규칙
미구현 기능은 코드 최상단에 `***! TODO: …` 주석으로 표시합니다.
