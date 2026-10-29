import { gaBootstrapScript } from '@/lib/ga'

/** GA4 loader (DATAI-681): the id is picked in the browser from location.hostname. */
export function GoogleAnalyticsLoader() {
  return <script id="ga-loader" dangerouslySetInnerHTML={{ __html: gaBootstrapScript() }} />
}
