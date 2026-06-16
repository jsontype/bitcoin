# broodev

> **broodev는 Google AdSense 수익화를 목표로, 실제로 쓸모 있는 웹앱들을 한 도메인 아래 모아 운영하는 앱 포트폴리오 회사입니다.** (운영: **Y-Systems**)
>
> 각 앱은 `xxx.broodev.com` 서브도메인으로 배포되고, 부모 도메인 **broodev.com** 이 전체 앱을 소개하는 포털 역할을 합니다.
> "양보다 질" — 스팸성 양산이 아니라 **btc 앱 수준의 실사용 가능한 앱**만 추가합니다.

![monorepo](https://img.shields.io/badge/monorepo-broodev-00ff9c) ![host](https://img.shields.io/badge/host-Cloudflare%20Pages-f38020) ![ads](https://img.shields.io/badge/monetize-AdSense-4285f4)

## 🧱 모노레포 구조

```text
broodev/
├─ apps/
│  ├─ web/        →  broodev.com        회사 소개 + 전체 앱 포털(유용한 앱들)
│  ├─ btc/        →  btc.broodev.com    비트코인 공포·탐욕 지수 & 매수 타이밍
│  └─ admin/      →  admin.broodev.com  관리자(데이터 수집·운영) — Google SSO 단독 접근
├─ packages/
│  └─ ui-terminal/   공통 "터미널/해킹" 테마(theme.css) — 모든 앱이 같은 룩 공유
└─ .github/workflows/   배포 파이프라인
```

## 📦 앱 목록

| 앱 | 도메인 | 설명 | 스택 | 상태 |
| --- | --- | --- | --- | --- |
| [web](apps/web/) | broodev.com | 회사 소개 + 유용한 앱들 포털 | React 18(CDN) · 정적 | 🟡 개발 중 |
| [btc](apps/btc/) | btc.broodev.com | 비트코인 공포·탐욕 지수 & 매수 타이밍 점수 | React 18 · Vite 5 | 🟢 라이브 |
| [admin](apps/admin/) | admin.broodev.com | 데이터 수집·운영 관리자 | React 18(CDN) · Google Identity | 🟡 개발 중 |

## 🎨 공통 디자인

모든 앱은 [`packages/ui-terminal/theme.css`](packages/ui-terminal/theme.css) 의 **네온 그린 터미널 테마**(JetBrains Mono · 스캔라인 · 패널 · 터미널 · 반응형)를 공유해 일관된 룩을 가집니다. 새 앱은 이 테마를 복사해 시작합니다.

## 🚀 배포 (Cloudflare Pages)

레포 1개를 연결하고 **앱마다 Pages 프로젝트**를 만들어 각자 서브도메인에 배포합니다.

| Pages 프로젝트 | Root directory | 도메인 |
| --- | --- | --- |
| broodev-web | `apps/web` | broodev.com |
| broodev-btc | `apps/btc` | btc.broodev.com |
| broodev-admin | `apps/admin` | admin.broodev.com |

> 전환기 동안 btc는 GitHub Pages(`.github/workflows/deploy-pages.yml`)로도 배포됩니다. 자세한 절차는 [docs/deploy-cloudflare.md](docs/deploy-cloudflare.md).

## 📁 앱 추가 규칙

1. `apps/<name>/` 폴더 생성, `packages/ui-terminal/theme.css` 복사.
2. **각 앱 `README.md` 최상단에 기술 스택을 명시한다.** (필수 규칙)
3. Cloudflare Pages에 프로젝트 추가 → `<name>.broodev.com` 연결.
4. AdSense `ads.txt`(루트) + 개인정보처리방침 링크 확보 후 사이트 승인 요청.

---

© Y-Systems · broodev
