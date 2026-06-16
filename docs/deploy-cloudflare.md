# Cloudflare Pages 배포 가이드 (broodev 모노레포)

레포 1개(`jsontype/bitcoin` → 추후 `broodev`)를 Cloudflare Pages에 연결하고, **앱마다 별도 Pages 프로젝트**를 만들어 각자 서브도메인에 배포한다. DNS·도메인이 이미 Cloudflare에 있어 서브도메인 연결이 한 번에 된다.

| Pages 프로젝트 | Root directory | 빌드 | 도메인 |
| --- | --- | --- | --- |
| `broodev-web`   | `apps/web`   | 없음(정적)        | broodev.com (+ www) |
| `broodev-btc`   | `apps/btc`   | 아래 ★ 참고       | btc.broodev.com |
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

## 2. admin (admin.broodev.com) — 정적
1. 위와 동일하게 새 Pages 프로젝트 `broodev-admin`, Root directory `apps/admin`, 빌드 없음, output `.`.
2. Custom domains → `admin.broodev.com` 추가.
3. **Google OAuth 설정** (로그인 동작용):
   - Google Cloud Console → 사용자 인증 정보 → **OAuth 2.0 클라이언트 ID(웹)** 생성.
   - **승인된 자바스크립트 원본**: `https://admin.broodev.com` + CF 프리뷰 도메인(`https://broodev-admin.pages.dev`).
   - 발급된 ID를 `apps/admin/app.jsx` 의 `GOOGLE_CLIENT_ID` 에 입력 후 커밋.
   - ⚠ admin 은 `noindex` 이고 클라이언트측 로그인은 임시 보호임. 실제 데이터 수집/보안은 백엔드(서버리스 + DB + 서버측 토큰 검증) 필요.

## 3. ★ btc (btc.broodev.com)
btc 는 자체완결 `standalone.html` + 보조 자산(sitemap/robots/ads.txt/og-image/adsense)을 함께 발행해야 한다. **빌드 없이** 복사만 하는 설정을 권장(가장 빠르고 안정적):

- 프로젝트 `broodev-btc`, **Root directory: `apps/btc`**
- **Build command:**
  ```bash
  mkdir -p out && cp standalone.html out/index.html && cp standalone.html sitemap.xml robots.txt ads.txt og-image.png out/ && mkdir -p out/adsense && cp adsense/index.html out/adsense/index.html
  ```
- **Build output directory:** `out`
- Custom domains → `btc.broodev.com` 추가.

> 대안(Vite 번들 배포): Build command `npm install && npm run build`, output `dist`. 단, 이 경우 sitemap/robots/ads.txt/og-image/adsense 를 `apps/btc/public/` 로 옮겨야 dist 에 포함된다.

### btc DNS 재지정 (GitHub Pages → Cloudflare Pages)
현재 `btc` CNAME 레코드는 GitHub Pages(`jsontype.github.io`)를 가리킨다. CF Pages로 옮기려면:
1. CF Pages `broodev-btc` → Custom domains → `btc.broodev.com` 추가 시도.
2. 충돌하면 DNS 탭에서 기존 `btc → jsontype.github.io` 레코드를 **삭제** → CF Pages가 자기 레코드를 생성하게 둔다.
3. 전파 후 `https://btc.broodev.com` 이 CF Pages 본을 가리키는지 확인.

## 4. GitHub Pages 은퇴 (btc 가 CF Pages에서 정상 확인된 뒤에만)
- `https://btc.broodev.com` 이 CF Pages로 잘 뜨는 것을 확인한 후:
  - `.github/workflows/deploy-pages.yml` 삭제(또는 비활성화).
  - `apps/btc/CNAME` 삭제(GitHub Pages 전용 파일, CF Pages에선 무시됨).
  - GitHub 저장소 Settings → Pages 비활성화.
- ⚠ 확인 전에는 절대 먼저 지우지 말 것(다운타임 방지).

## 5. 배포 후 체크리스트
- [ ] https://broodev.com — 회사 포털(회사소개/유용한 앱들) 정상
- [ ] https://btc.broodev.com — btc 앱 정상 + `/ads.txt` 200
- [ ] https://admin.broodev.com — 로그인 게이트 표시(허용 계정만 진입)
- [ ] broodev.com/ads.txt 200 (AdSense 루트 게재)
- [ ] AdSense 대시보드에 각 사이트 추가 + 승인 요청
- [ ] (선택) Search Console / Naver 등록 + sitemap 제출

## 메모: 모노레포 자동 빌드 최적화
CF Pages 프로젝트별 **Build watch paths** 를 각 앱 폴더로 좁히면, 해당 앱이 바뀔 때만 재배포된다(예: `broodev-btc` 는 `apps/btc/*` 변경 시에만).
