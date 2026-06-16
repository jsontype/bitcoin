# AdSense 버전

메인 앱([standalone.html](../standalone.html))의 **Google AdSense 전용 복제본**입니다.
- 라이브(배포 후): https://btc.broodev.com/adsense/
- 코드·기능은 standalone과 동일 (자체완결 · CDN React · 빌드 불필요)
- 차이: `<head>`에 AdSense 스크립트 자리, 본문에 광고 슬롯 자리를 **주석**으로 넣어둠 (`index.html`의 STEP 1~2)

## 현재 상태
- **기본(Auto ads) 활성화됨** — `<head>`에 `ca-pub-2639315913402952`로 AdSense 스크립트가 들어가 있음.
  → 게시자 ID가 맞는지 확인하고, AdSense 대시보드에서 **Auto ads ON** + **사이트 승인**이 되면 광고가 자동 게재됩니다.
- (선택) 특정 위치 고정 광고가 필요하면 SEO 본문의 `<ins class="adsbygoogle">`에서 `data-ad-slot`을 채우고 주석 해제.
  - 광고는 `#root` **바깥(본문 영역)**에 둬야 React 렌더에 안 지워집니다. 앱 화면 안(상단 등)에 넣으려면 standalone의 JSX 레이아웃에 직접 추가해야 합니다.
3. **ads.txt** — AdSense는 사이트 루트에 `ads.txt`가 필요합니다:
   ```
   google.com, pub-2639315913402952, DIRECT, f08c47fec0942fa0
   ```
   ⚠️ GitHub Pages 프로젝트 경로(`/bitcoin/ads.txt`)는 표준 위치(호스트 루트)가 아니라 인식이 안 될 수 있습니다 → **커스텀 도메인**이면 루트(`/ads.txt`)에 두어 해결.

## 배포
- 배포 워크플로가 이 폴더를 `_site/adsense/`로 발행합니다 → `/bitcoin/adsense/`로 접속.
- ⚠️ AdSense 승인 심사는 **콘텐츠가 충분한 실제 페이지**를 요구합니다. 단순 도구 화면보다, 하단 SEO 본문(공포지수 설명·FAQ)이 있는 이 페이지가 유리합니다.
