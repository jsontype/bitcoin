# ui-terminal

**기술 스택:** 순수 CSS (빌드 불필요) · CSS 변수 토큰 · Google Fonts(JetBrains Mono / Share Tech Mono)

broodev 전 앱이 공유하는 **네온 그린 터미널/해킹 테마**입니다. 이 폴더의 [`theme.css`](theme.css) 가 **원본(source of truth)**.

## 제공 요소
- 디자인 토큰(`:root` CSS 변수): 색·폰트·반경
- 배경 효과: `.scanlines` · `.vignette` · `.matrix-rain`
- 사이드바 앱 레이아웃: `.layout` · `.sidebar` · `.nav-link` · `.topbar` · `.content` (모바일 드로어 포함)
- 컴포넌트: `.panel` · `.card`/`.cards` · `.btn` · `.chip` · `.tag` · 폼(`.field`) · 테이블(`.tbl`)+페이지네이션(`.pager`) · `.terminal`
- 본문 타이포: `.prose`
- 목업 표식 배너: `.mock-note`

## 사용
빌드 도구가 없으므로(로컬 Node 미사용) 각 앱은 이 파일을 **자기 폴더로 복사**해 `<link rel="stylesheet" href="theme.css">` 로 로드합니다.

```bash
cp packages/ui-terminal/theme.css apps/<name>/theme.css
```

> 디자인 수정은 **여기서** 하고 각 앱으로 다시 복사하세요. (drift 방지)
> 폰트는 각 앱 `<head>` 에서 로드: `JetBrains+Mono:wght@400;500;700;800` + `Share+Tech+Mono`.
