/**
 * GA4 measurement ids, chosen in the browser by hostname (DATAI-681).
 * The ids are public (they ship in every page), so they live in the repo
 * instead of an untracked .env file: a clean checkout must build the same
 * site. Hosts not listed here (localhost, previews) load no GA at all but
 * keep a local dataLayer queue so trackAG() and e2e tests still work.
 */
export const GA_PROD_ID = 'G-BHS28B1S3P'
export const GA_UAT_ID = 'G-6QKQKHMYJV'

export const GA_IDS_BY_HOST: Readonly<Record<string, string>> = Object.freeze({
  'www.mlytics.com': GA_PROD_ID,
  'mlytics.com': GA_PROD_ID,
  'mlytics.co': GA_UAT_ID,
  'www.mlytics.co': GA_UAT_ID,
})

const REQUIRED_HOSTS = ['www.mlytics.com', 'mlytics.co'] as const
const MEASUREMENT_ID = /^G-[A-Z0-9]{4,}$/

/** Throws (and so fails `next build`) when the map cannot serve production or UAT. */
export function assertGaIds(map: Readonly<Record<string, string>>): void {
  for (const host of REQUIRED_HOSTS) {
    if (!(host in map)) throw new Error(`GA: no measurement id for ${host} (lib/ga.ts)`)
  }
  for (const [host, id] of Object.entries(map)) {
    if (!MEASUREMENT_ID.test(id)) throw new Error(`GA: "${id}" for ${host} is not a GA4 measurement id (lib/ga.ts)`)
  }
}

/**
 * Inline script for <head>/<body>: picks the id for location.hostname.
 * One trailing dot is dropped (www.mlytics.com. is the same host), and only
 * own keys match so names like "constructor" never resolve. Kept ES5-safe.
 */
export function gaBootstrapScript(map: Readonly<Record<string, string>> = GA_IDS_BY_HOST): string {
  assertGaIds(map)
  return `(function(){var ids=${JSON.stringify(map)};var h=location.hostname.replace(/\\.$/,'');` +
    `var id=Object.prototype.hasOwnProperty.call(ids,h)?ids[h]:undefined;` +
    `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}window.gtag=gtag;` +
    `gtag('js',new Date());if(!id)return;gtag('config',id);` +
    `var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+id;` +
    `document.head.appendChild(s);})();`
}
