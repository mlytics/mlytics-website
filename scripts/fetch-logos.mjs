import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../public/logos')

const CLIENTS = [
  { key: 'bella',        name: 'Bella.tw 儂儂',  domain: 'bella.tw' },
  { key: 'cmoney',       name: 'CMoney',          domain: 'cmoney.tw' },
  { key: 'nownews',      name: 'NOWnews',         domain: 'nownews.com' },
  { key: 'ucar',         name: 'U-CAR',           domain: 'u-car.com.tw' },
  { key: 'meet',         name: '創業小聚',         domain: 'meet.bnext.com.tw' },
  { key: 'bnext',        name: '數位時代',         domain: 'bnext.com.tw' },
  { key: 'edh',          name: '早安健康',         domain: 'edh.tw' },
  { key: 'fc',           name: '未來商務',         domain: 'fc.bnext.com.tw' },
  { key: 'ebc',          name: '東森娛樂',         domain: 'ebc.net.tw' },
  { key: 'managertoday', name: '經理人',           domain: 'managertoday.com.tw' },
  { key: 'udn',          name: '聯合新聞網',       domain: 'udn.com' },
  { key: 'gugu',         name: '股股知識庫',       domain: 'gugu.fund' },
  { key: 'gvm',          name: '遠見雜誌',         domain: 'gvm.com.tw' },
  { key: 'cnyes',        name: '鉅亨網',           domain: 'cnyes.com' },
  { key: 'foodnext',     name: '食力 foodNEXT',    domain: 'foodnext.net' },
]

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 10000,
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href
        resolve(fetchUrl(redirectUrl, maxRedirects - 1))
        return
      }
      const chunks = []
      res.on('data', chunk => chunks.push(chunk))
      res.on('end', () => resolve({ status: res.statusCode, data: Buffer.concat(chunks), headers: res.headers, url }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function downloadFile(url, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'image/*,*/*',
      },
      timeout: 10000,
    }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) && res.headers.location && maxRedirects > 0) {
        const redirectUrl = new URL(res.headers.location, url).href
        resolve(downloadFile(redirectUrl, destPath, maxRedirects - 1))
        return
      }
      if (res.statusCode !== 200) {
        res.resume()
        reject(new Error(`HTTP ${res.statusCode}`))
        return
      }
      const contentType = res.headers['content-type'] || ''
      if (!contentType.includes('image') && !contentType.includes('svg')) {
        res.resume()
        reject(new Error(`Not an image: ${contentType}`))
        return
      }
      const stream = fs.createWriteStream(destPath)
      res.pipe(stream)
      stream.on('finish', () => {
        stream.close()
        const stat = fs.statSync(destPath)
        if (stat.size < 100) {
          fs.unlinkSync(destPath)
          reject(new Error('File too small'))
        } else {
          resolve(destPath)
        }
      })
      stream.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function extractLogoFromHtml(domain) {
  const urls = [`https://${domain}`, `https://www.${domain}`]
  for (const baseUrl of urls) {
    try {
      const res = await fetchUrl(baseUrl)
      if (res.status !== 200) continue
      const html = res.data.toString('utf8').substring(0, 30000)

      // Try to extract logo/og:image/apple-touch-icon
      const patterns = [
        // og:image
        /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
        /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
        // apple-touch-icon (usually high quality)
        /rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*href=["']([^"']+)["']/i,
        /href=["']([^"']+)["'][^>]*rel=["'][^"']*apple-touch-icon[^"']*["']/i,
        // Specific logo patterns
        /class=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+\.(?:png|svg|webp|jpg|jpeg))["']/i,
        /id=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+\.(?:png|svg|webp|jpg|jpeg))["']/i,
        /alt=["'][^"']*logo[^"']*["'][^>]*src=["']([^"']+\.(?:png|svg|webp|jpg|jpeg))["']/i,
        /src=["']([^"']*logo[^"']*\.(?:png|svg|webp|jpg|jpeg))["']/i,
      ]

      for (const pattern of patterns) {
        const match = html.match(pattern)
        if (match) {
          const imgUrl = match[1].startsWith('http') ? match[1] : new URL(match[1], res.url).href
          if (imgUrl && !imgUrl.includes('facebook') && !imgUrl.includes('twitter')) {
            return imgUrl
          }
        }
      }
    } catch (e) {
      // continue
    }
  }
  return null
}

async function fetchGoogleFavicon(domain, key) {
  const dest = path.join(OUT_DIR, `${key}.png`)
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
  try {
    await downloadFile(url, dest)
    return dest
  } catch (e) {
    return null
  }
}

async function processClient(client) {
  const { key, name, domain } = client
  console.log(`\n[${key}] ${name} (${domain})`)

  // Step 1: Try to extract logo from website HTML
  console.log(`  → Scanning website for logo URL...`)
  const logoUrl = await extractLogoFromHtml(domain)
  
  if (logoUrl) {
    console.log(`  → Found logo URL: ${logoUrl}`)
    const ext = logoUrl.includes('.svg') ? 'svg' : 'png'
    const dest = path.join(OUT_DIR, `${key}.${ext}`)
    try {
      await downloadFile(logoUrl, dest)
      const stat = fs.statSync(dest)
      console.log(`  ✓ Downloaded logo (${stat.size} bytes)`)
      return { key, file: `${key}.${ext}`, source: 'website' }
    } catch (e) {
      console.log(`  ✗ Download failed: ${e.message}`)
    }
  }

  // Step 2: Fallback to Google favicon
  console.log(`  → Trying Google favicon...`)
  const faviconResult = await fetchGoogleFavicon(domain, key)
  if (faviconResult) {
    const stat = fs.statSync(faviconResult)
    console.log(`  ✓ Got favicon (${stat.size} bytes)`)
    return { key, file: `${key}.png`, source: 'favicon' }
  }

  console.log(`  ✗ All methods failed`)
  return { key, file: null, source: null }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  
  // Clean up test files
  try { fs.unlinkSync(path.join(OUT_DIR, 'test_google_favicon.png')) } catch {}

  const results = []
  for (const client of CLIENTS) {
    const result = await processClient(client)
    results.push(result)
  }

  console.log('\n\n=== SUMMARY ===')
  for (const r of results) {
    console.log(`${r.key}: ${r.file ? `✓ ${r.file} (${r.source})` : '✗ failed'}`)
  }

  console.log('\n=== LOGO MAP (for component) ===')
  const map = {}
  for (const r of results) {
    if (r.file) map[r.key] = `/logos/${r.file}`
  }
  console.log(JSON.stringify(map, null, 2))
}

main().catch(console.error)
