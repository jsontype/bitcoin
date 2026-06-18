// Cloudflare Pages Function (엣지) — 공유 썸네일(OG) 다국어화
// 카톡/페북 등 크롤러는 JS를 안 돌리고 URL의 HTML만 읽는다. 그래서 ?lang= 에 따라
// 응답 직전에 OG 메타(title/description/locale/image)를 해당 언어로 갈아끼운다.
// 기본(ko) 또는 미지원 lang → 원본 HTML 그대로(한국어).

const IMG = 'https://btc.broodev.com';
const M = {
  en: { t: 'Bitcoin Fear & Greed Index · Buy-Timing Score | BTC_SIGNAL', d: 'Real-time Bitcoin Fear & Greed Index plus RSI, MACD, Mayer Multiple and more — 6 indicators in one 0–100 buy-timing score. Free, no install.', l: 'en_US', img: IMG + '/og-en.png' },
  ja: { t: 'ビットコイン 恐怖・強欲指数 · 買い時スコア | BTC_SIGNAL', d: 'ビットコインの恐怖・強欲指数にRSI・MACD・マイヤー倍率など6指標を合成し、買い時を0〜100で示す無料ダッシュボード。インストール不要。', l: 'ja_JP', img: IMG + '/og-ja.png' },
  zh: { t: '比特币恐惧与贪婪指数 · 买入时机评分 | BTC_SIGNAL', d: '实时比特币恐惧与贪婪指数，结合RSI、MACD、梅耶倍数等6项指标，合成0–100买入时机评分。免费，无需安装。', l: 'zh_CN', img: IMG + '/og-en.png' },
  'zh-Hant': { t: '比特幣恐懼與貪婪指數 · 買入時機評分 | BTC_SIGNAL', d: '即時比特幣恐懼與貪婪指數，結合RSI、MACD、梅耶倍數等6項指標，合成0–100買入時機評分。免費，免安裝。', l: 'zh_TW', img: IMG + '/og-en.png' },
  es: { t: 'Índice de miedo y codicia de Bitcoin · Puntuación de compra | BTC_SIGNAL', d: 'Índice de miedo y codicia de Bitcoin en tiempo real con RSI, MACD, múltiplo de Mayer y más: 6 indicadores en una puntuación 0–100. Gratis, sin instalación.', l: 'es_ES', img: IMG + '/og-en.png' },
  fr: { t: "Indice de peur et d'avidité Bitcoin · Score de timing d'achat | BTC_SIGNAL", d: "Indice de peur et d'avidité Bitcoin en temps réel avec RSI, MACD, multiple de Mayer et plus : 6 indicateurs en un score 0–100. Gratuit, sans installation.", l: 'fr_FR', img: IMG + '/og-en.png' },
  de: { t: 'Bitcoin Angst- & Gier-Index · Kaufzeitpunkt-Score | BTC_SIGNAL', d: 'Echtzeit Bitcoin Angst- & Gier-Index mit RSI, MACD, Mayer-Multiple und mehr — 6 Indikatoren als 0–100 Kaufzeitpunkt-Score. Kostenlos, ohne Installation.', l: 'de_DE', img: IMG + '/og-en.png' },
  it: { t: "Indice di paura e avidità Bitcoin · Punteggio di acquisto | BTC_SIGNAL", d: "Indice di paura e avidità di Bitcoin in tempo reale con RSI, MACD, multiplo di Mayer e altro: 6 indicatori in un punteggio 0–100. Gratis, nessuna installazione.", l: 'it_IT', img: IMG + '/og-en.png' },
  pt: { t: 'Índice de medo e ganância do Bitcoin · Pontuação de compra | BTC_SIGNAL', d: 'Índice de medo e ganância do Bitcoin em tempo real com RSI, MACD, múltiplo de Mayer e mais: 6 indicadores numa pontuação 0–100. Grátis, sem instalação.', l: 'pt_PT', img: IMG + '/og-en.png' },
  ru: { t: 'Индекс страха и жадности биткоина · Оценка времени покупки | BTC_SIGNAL', d: 'Индекс страха и жадности биткоина в реальном времени плюс RSI, MACD, мультипликатор Майера и другое — 6 индикаторов в оценке 0–100. Бесплатно, без установки.', l: 'ru_RU', img: IMG + '/og-en.png' },
  nl: { t: 'Bitcoin Angst- & Hebzucht-index · Koopmoment-score | BTC_SIGNAL', d: 'Realtime Bitcoin Angst- & Hebzucht-index met RSI, MACD, Mayer Multiple en meer — 6 indicatoren in één 0–100 koopmoment-score. Gratis, geen installatie.', l: 'nl_NL', img: IMG + '/og-en.png' },
  th: { t: 'ดัชนีความกลัวและความโลภบิตคอยน์ · คะแนนจังหวะซื้อ | BTC_SIGNAL', d: 'ดัชนีความกลัว-ความโลภบิตคอยน์แบบเรียลไทม์ พร้อม RSI, MACD, Mayer Multiple และอื่นๆ รวม 6 ตัวชี้วัดเป็นคะแนนจังหวะซื้อ 0–100 ฟรี ไม่ต้องติดตั้ง', l: 'th_TH', img: IMG + '/og-en.png' },
};

class AttrSetter { constructor(v) { this.v = v; } element(el) { el.setAttribute('content', this.v); } }
class TextSetter { constructor(v) { this.v = v; } element(el) { el.setInnerContent(this.v); } }
class LangSetter { constructor(v) { this.v = v; } element(el) { el.setAttribute('lang', this.v); } }

export async function onRequest(context) {
  const { request, next } = context;
  const res = await next();
  try {
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('text/html')) return res;
    const lang = new URL(request.url).searchParams.get('lang');
    const m = lang && M[lang];
    if (!m) return res; // ko/미지정/미지원 → 원본(한국어) 그대로

    return new HTMLRewriter()
      .on('html', new LangSetter(lang))
      .on('title', new TextSetter(m.t))
      .on('meta[name="description"]', new AttrSetter(m.d))
      .on('meta[property="og:title"]', new AttrSetter(m.t))
      .on('meta[property="og:description"]', new AttrSetter(m.d))
      .on('meta[property="og:locale"]', new AttrSetter(m.l))
      .on('meta[property="og:image"]', new AttrSetter(m.img))
      .on('meta[name="twitter:title"]', new AttrSetter(m.t))
      .on('meta[name="twitter:description"]', new AttrSetter(m.d))
      .on('meta[name="twitter:image"]', new AttrSetter(m.img))
      .transform(res);
  } catch (e) {
    return res;
  }
}
