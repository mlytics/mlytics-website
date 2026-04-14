/**
 * Targeted logo fetching for brands that only got favicons.
 * Tries common logo paths and specific known URLs.
 */
import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../public/logos')

function downloadFile(url, destPath, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*',
        'Referer': url,
      },
      timeout: 10000,
    }, (res) => {
      if ([301, 302, 307, 308].includes(res.statusCode) && res.headers.location && maxRedirects > 0) {
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
      if (!contentType.includes('image') && !contentType.includes('svg') && !contentType.includes('octet')) {
        res.resume()
        reject(new Error(`Not an image: ${contentType}`))
        return
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => {
        const buf = Buffer.concat(chunks)
        if (buf.length < 200) { reject(new Error('Too small')); return }
        fs.writeFileSync(destPath, buf)
        resolve(destPath)
      })
      res.on('error', reject)
    })
    req.on('error', reject)
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')) })
  })
}

async function tryUrls(key, urls) {
  for (const { url, ext } of urls) {
    const dest = path.join(OUT_DIR, `${key}.${ext}`)
    try {
      await downloadFile(url, dest)
      const stat = fs.statSync(dest)
      console.log(`  ✓ ${url} (${stat.size} bytes)`)
      return true
    } catch (e) {
      console.log(`  ✗ ${url}: ${e.message}`)
    }
  }
  return false
}

// Targeted logo candidates for each brand
const TARGETS = [
  {
    key: 'bella',
    urls: [
      { url: 'https://media.bella.tw/content/images/2021/09/bella-logo.png', ext: 'png' },
      { url: 'https://bella.tw/wp-content/uploads/logo.png', ext: 'png' },
      { url: 'https://bella.tw/wp-content/themes/bella/images/logo.png', ext: 'png' },
      { url: 'https://bella.tw/images/logo.svg', ext: 'svg' },
      { url: 'https://media.bella.tw/content/images/size/w2000/2021/09/bella-logo.png', ext: 'png' },
    ]
  },
  {
    key: 'ucar',
    urls: [
      { url: 'https://www.u-car.com.tw/images/logo.svg', ext: 'svg' },
      { url: 'https://www.u-car.com.tw/images/logo.png', ext: 'png' },
      { url: 'https://www.u-car.com.tw/img/logo.png', ext: 'png' },
      { url: 'https://www.u-car.com.tw/ucar/images/logo.png', ext: 'png' },
      { url: 'https://www.u-car.com.tw/static/images/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'meet',
    urls: [
      { url: 'https://cdn.bnextmedia.com.tw/assets/meet/logo.png', ext: 'png' },
      { url: 'https://cdn.bnextmedia.com.tw/assets/meet/logo.svg', ext: 'svg' },
      { url: 'https://meet.bnext.com.tw/static/images/logo.png', ext: 'png' },
      { url: 'https://meet.bnext.com.tw/images/logo.png', ext: 'png' },
      { url: 'https://cdn.bnextmedia.com.tw/assets/meet/meet-logo.png', ext: 'png' },
    ]
  },
  {
    key: 'edh',
    urls: [
      { url: 'https://www.edh.tw/images/logo.svg', ext: 'svg' },
      { url: 'https://www.edh.tw/images/logo.png', ext: 'png' },
      { url: 'https://www.edh.tw/img/logo.png', ext: 'png' },
      { url: 'https://www.edh.tw/static/images/logo.png', ext: 'png' },
      { url: 'https://cdn.edh.tw/img/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'fc',
    urls: [
      { url: 'https://cdn.bnextmedia.com.tw/assets/fc/logo.png', ext: 'png' },
      { url: 'https://cdn.bnextmedia.com.tw/assets/fc/logo.svg', ext: 'svg' },
      { url: 'https://fc.bnext.com.tw/images/logo.png', ext: 'png' },
      { url: 'https://fc.bnext.com.tw/static/images/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'managertoday',
    urls: [
      { url: 'https://www.managertoday.com.tw/images/logo.svg', ext: 'svg' },
      { url: 'https://www.managertoday.com.tw/static/images/logo.png', ext: 'png' },
      { url: 'https://cdn.managertoday.com.tw/images/logo.png', ext: 'png' },
      { url: 'https://www.managertoday.com.tw/public/images/logo.png', ext: 'png' },
      { url: 'https://www.managertoday.com.tw/img/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'udn',
    urls: [
      { url: 'https://a.udn.com/udnNewLogo.png', ext: 'png' },
      { url: 'https://www.udn.com/static/images/logo.svg', ext: 'svg' },
      { url: 'https://www.udn.com/images/logo.png', ext: 'png' },
      { url: 'https://udn.com/static/img/logo.png', ext: 'png' },
      { url: 'https://a1.udn.com/img/logo/udn-logo.png', ext: 'png' },
    ]
  },
  {
    key: 'gugu',
    urls: [
      { url: 'https://www.gugu.fund/images/logo.png', ext: 'png' },
      { url: 'https://www.gugu.fund/images/logo.svg', ext: 'svg' },
      { url: 'https://gugu.fund/images/logo.png', ext: 'png' },
      { url: 'https://www.gugu.fund/static/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'foodnext',
    urls: [
      { url: 'https://www.foodnext.net/images/logo.png', ext: 'png' },
      { url: 'https://www.foodnext.net/images/logo.svg', ext: 'svg' },
      { url: 'https://www.foodnext.net/img/logo.png', ext: 'png' },
      { url: 'https://cdn.foodnext.net/images/logo.png', ext: 'png' },
      { url: 'https://www.foodnext.net/public/images/logo.png', ext: 'png' },
    ]
  },
  // Also try to get better versions of website-sourced ones
  {
    key: 'nownews',
    urls: [
      { url: 'https://www.nownews.com/images/logo.png', ext: 'png' },
      { url: 'https://www.nownews.com/images/logo.svg', ext: 'svg' },
      { url: 'https://www.nownews.com/img/logo.png', ext: 'png' },
      { url: 'https://www.nownews.com/static/images/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'gvm',
    urls: [
      { url: 'https://www.gvm.com.tw/images/logo.svg', ext: 'svg' },
      { url: 'https://www.gvm.com.tw/images/logo.png', ext: 'png' },
      { url: 'https://www.gvm.com.tw/public/images/logo.png', ext: 'png' },
      { url: 'https://www.gvm.com.tw/img/logo.png', ext: 'png' },
    ]
  },
  {
    key: 'cnyes',
    urls: [
      { url: 'https://www.cnyes.com/static/anue-logo.svg', ext: 'svg' },
      { url: 'https://www.cnyes.com/images/logo.svg', ext: 'svg' },
      { url: 'https://www.cnyes.com/images/logo.png', ext: 'png' },
      { url: 'https://static.cnyes.com/images/logo.png', ext: 'png' },
    ]
  },
]

async function main() {
  console.log('Trying to find better logos...\n')
  for (const { key, urls } of TARGETS) {
    console.log(`[${key}]`)
    const found = await tryUrls(key, urls)
    if (!found) {
      console.log(`  → Keeping existing file`)
    }
  }

  console.log('\n=== Final logos directory ===')
  const files = fs.readdirSync(OUT_DIR).filter(f => !f.startsWith('.'))
  for (const f of files) {
    const stat = fs.statSync(path.join(OUT_DIR, f))
    console.log(`  ${f} (${stat.size} bytes)`)
  }
}

main().catch(console.error)
