import {
  LEGACY_SECTIONS,
  CDN_KEYWORDS,
  EXCLUDED_SECTIONS,
} from './cdnPaths'

/**
 * Why this exists at all.
 *
 * `output: 'export'` prerenders ONE `out/404.html`, and the static host serves
 * those same bytes at whatever URL was requested. So the page cannot be
 * branched at render time: whichever variant React picked during the build is
 * the only markup in the file. Branching on `usePathname()` in a client
 * component instead produces a hydration mismatch (React error #418) and a
 * visible flash of the wrong variant, on exactly the URLs this feature targets.
 *
 * Instead the static file carries BOTH variants and this script — inlined
 * ahead of them, so it runs during parse and before first paint — stamps
 * `data-nf` on <html>. CSS in globals.css then reveals one and hides the
 * other, so the first paint is already correct and the markup React hydrates
 * is identical for every visitor.
 *
 * With JavaScript unavailable the attribute is never set and the generic
 * variant shows, which is the correct fallback.
 *
 * This duplicates the algorithm in `isCdnLegacyPath` because that function
 * cannot run before its own bundle loads. The rule data is imported rather
 * than restated, and cdnPaths.test.ts asserts the two implementations agree
 * on every sample path.
 */
export function buildVariantScript(): string {
  const data = JSON.stringify({
    s: LEGACY_SECTIONS,
    k: CDN_KEYWORDS,
    x: EXCLUDED_SECTIONS,
  })

  return `(function(){try{var R=${data};
var g=location.pathname.toLowerCase().split("/").filter(Boolean);
var cdn=false;
if(!g.some(function(v){return R.x.indexOf(v)>-1})){
if(g.some(function(v){return R.s.indexOf(v)>-1})){cdn=true}
else{cdn=g.some(function(v){return R.k.some(function(w){
return new RegExp("(?:^|[-_.])"+w+"(?:[-_.]|$)").test(v)})})}}
document.documentElement.setAttribute("data-nf",cdn?"cdn":"default")}catch(e){}})();`
}
