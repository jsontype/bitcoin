# Cloudflare Pages 배포 가이드 (broodev 모노레포)

레포 1개(`jsontype/bitcoin` → 추후 `broodev`)를 Cloudflare Pages에 연결하고, **앱마다 별도 Pages 프로젝트**를 만들어 각자 서브도메인에 배포한다. DNS·도메인이 이미 Cloudflare에 있어 서브도메인 연결이 한 번에 된다.

| Pages 프로젝트 | Root directory | 빌드 | 도메인 |
| --- | --- | --- | --- |
| `broodev-web`   | `apps/web`   | 없음(정적)        | broodev.com (+ www) |
| `broodev-btc`   | `apps/btc`   | 없음(정적)        | btc.broodev.com |
| `broodev-admin` | `apps/admin` | 없음(정적)        | admin.broodev.com |

---

## 0. 사전
- Cloudflare 계정에 `broodev.com` 존재(DNS 관리 중) — 완료됨.
- GitHub 레포가 public 이고 master 에 이 모노레포가 머지되어 있을 것.

## 1. web (broodev.com) — 정적
1. Cloudflare 대시보드 → **Workers & Pages → Create → Pages → Connect to Git** → 레포 선택.
2. 프로젝트 이름 `broodev-web`.
3. **Build settings**
   - Framework preset: **None**
   - Build command: *(비움)*
   - Build output directory: `.`
   - **Root directory (advanced): `apps/web`**
4. Save and Deploy → `*.pages.dev` 프리뷰 확인.
5. **Custom domains** 탭 → `broodev.com` 추가 → (원하면 `www.broodev.com` 도) → CF가 DNS 레코드를 자동 생성/검증.

## 1-B. (AdSense 대응) broodev.com 루트 = btc 앱으로 전환 ⭐
`broodev.com` 루트가 AdSense **“가치 없는 콘텐츠”**로 미충족됨(2026-07). 심사 관문인 루트에 얇은 포털 대신 **콘텐츠가 풍부한 btc 앱을 서빙**한다. 코드 준비(canonical=`https://broodev.com/`, 정적 푸터, `privacy.html`·`terms.html`, sitemap/robots)는 이미 `apps/btc` 에 반영됨 — Cloudflare에서 루트만 재지정하면 된다.

1. Cloudflare → `broodev-web` 프로젝트 → **Settings → Builds & deployments → Root directory** 를 `apps/web` → **`apps/btc`** 로 변경.
2. **Retry deployment**(또는 새 커밋 push)로 재배포.
3. `btc.broodev.com`(`broodev-btc`) 중복 콘텐츠 처리 — 둘 중 하나:
   - (권장) `apps/btc` 의 canonical 이 이미 `https://broodev.com/` 이므로 그대로 둬도 검색엔진이 루트로 통합.
   - 또는 `broodev-btc` 에 `_redirects` 파일 추가로 301: `/*  https://broodev.com/:splat  301`
4. 전파 후 확인: `https://broodev.com/` 이 **대시보드 렌더** + `https://broodev.com/ads.txt`·`/privacy.html`·`/terms.html` 이 **200**.
5. AdSense → 사이트 `broodev.com` **재심사 요청**.

> 회사 포털(`apps/web`)은 심사 통과 후 `broodev.com/about` 서브경로나 별도 서브도메인으로 재배치 예정. 지금은 루트를 btc로 두는 것이 우선.

## 2. admin (admin.broodev.com) — 정적
1. 위와 동일하게 새 Pages 프로젝트 `broodev-admin`, Root directory `apps/admin`, 빌드 없음, output `.`.
2. Custom domains → `admin.broodev.com` 추가.
3. **Google OAuth 설정** (로그인 동작용):
   - Google Cloud Console → 사용자 인증 정보 → **OAuth 2.0 클라이언트 ID(웹)** 생성.
   - **승인된 자바스크립트 원본**: `https://admin.broodev.com` + CF 프리뷰 도메인(`https://broodev-admin.pages.dev`).
   - 발급된 ID를 `apps/admin/app.jsx` 의 `GOOGLE_CLIENT_ID` 에 입력 후 커밋.
   - ⚠ admin 은 `noindex` 이고 클라이언트측 로그인은 임시 보호임. 실제 데이터 수집/보안은 백엔드(서버리스 + DB + 서버측 토큰 검증) 필요.

## 3. btc (btc.broodev.com) — 정적
btc 의 `apps/btc/index.html` 은 자체완결 단일 파일(CDN React + 인라인)이라 **web/admin과 동일하게 빌드가 없다.**

- 프로젝트 `broodev-btc`, **Root directory: `apps/btc`**
- **Build command: 비움**
- **Build output directory: `/`**
- 보조 자산(sitemap/robots/ads.txt/og-image/adsense)은 이미 `apps/btc` 안에 있어 함께 발행됨.
- Custom domains → `btc.broodev.com` 추가.

### btc DNS 재지정 (GitHub Pages → Cloudflare Pages)
현재 `btc` CNAME 레코드는 GitHub Pages(`jsontype.github.io`)를 가리킨다. CF Pages로 옮기려면:
1. CF Pages `broodev-btc` → Custom domains → `btc.broodev.com` 추가 시도.
2. 충돌하면 DNS 탭에서 기존 `btc → jsontype.github.io` 레코드를 **삭제** → CF Pages가 자기 레코드를 생성하게 둔다.
3. 전파 후 `https://btc.broodev.com` 이 CF Pages 본을 가리키는지 확인.

## 4. GitHub Pages 은퇴 (완료)
btc 가 CF Pages(btc.broodev.com)에서 정상 확인되어 GitHub Pages는 은퇴함:
- ✅ `.github/workflows/deploy-pages.yml` 삭제됨
- ✅ `apps/btc/CNAME` 삭제됨
- (남은 수동 작업) GitHub 저장소 **Settings → Pages** 에서 비활성화 + 기존 `btc → jsontype.github.io` DNS 레코드가 남아있으면 삭제.

## 5. 배포 후 체크리스트
- [ ] https://broodev.com — 회사 포털(회사소개/유용한 앱들) 정상
- [ ] https://btc.broodev.com — btc 앱 정상 + `/ads.txt` 200
- [ ] https://admin.broodev.com — 로그인 게이트 표시(허용 계정만 진입)
- [ ] broodev.com/ads.txt 200 (AdSense 루트 게재)
- [ ] AdSense 대시보드에 각 사이트 추가 + 승인 요청
- [ ] (선택) Search Console / Naver 등록 + sitemap 제출

## 메모: 모노레포 자동 빌드 최적화
CF Pages 프로젝트별 **Build watch paths** 를 각 앱 폴더로 좁히면, 해당 앱이 바뀔 때만 재배포된다(예: `broodev-btc` 는 `apps/btc/*` 변경 시에만).
