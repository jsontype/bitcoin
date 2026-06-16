# admin — admin.broodev.com (운영 관리자 콘솔)

**기술 스택:** React 18 (CDN UMD) · 브라우저 Babel (빌드 불필요) · 해시 라우팅 SPA · Google Identity Services(SSO) · 공통 `theme.css`(ui-terminal) · 정적 호스팅(Cloudflare Pages)

broodev 전체 앱의 **데이터 수집·운영**을 위한 내부 관리자 콘솔입니다. 회원가입 없음 — **Google SSO로 운영자(jsontyper@gmail.com)만** 접근합니다. 검색엔진 비노출(`noindex`).

## 구성
- `index.html` — noindex 메타 + 폰트 + React/Babel 로드 (#8에서 Google Identity 스크립트 추가)
- `app.jsx` — 사이드바 SPA. `NAV` + `SECTIONS` 레지스트리
- `theme.css` — 공통 테마 사본 (원본: `packages/ui-terminal/theme.css`)

## 메뉴
| 경로 | 내용 |
| --- | --- |
| `#/dashboard` | 운영 요약 대시보드 |
| `#/apps` | 앱별 상태 |
| `#/collect` | 데이터 수집 잡 관리 |
| `#/queries` | 수집 데이터 조회 / 로그 |
| `#/analytics` | 트래픽·수익 |
| `#/terminal` | 명령 터미널 |
| `#/settings` | 일반·연동·테마 설정 |

## ⚠ 보안 주의
정적 페이지의 **클라이언트측 Google 로그인은 "진짜 보안"이 아닙니다** (소스 공개·우회 가능). 현재 단계는 **화면/형태 + 목업 데이터**까지입니다. 실제 데이터 수집·보안은 **백엔드(서버리스 + DB) + 서버측 토큰 검증**을 붙일 때 완성됩니다.

## 목업 규칙
미구현 기능은 코드 최상단에 `***! TODO: …` 주석으로 표시합니다.
