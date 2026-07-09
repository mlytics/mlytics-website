'use client'

import { useState } from 'react'

// grayscale(1): removes color. opacity controls visibility.
// invert(1) is prepended for logos designed as white-on-dark (e.g. CMoney).
// brightness adjusts individual logo darkness (default 1, lower = darker).
const grayFilter = (invert = false, brightness = 1, opacity = 0.5) =>
  `${invert ? 'invert(1) ' : ''}grayscale(1) brightness(${brightness}) opacity(${opacity})`

// w = intrinsic width from each SVG's viewBox (all logo viewBoxes are 50 high);
// rendered as width/height attributes so the browser knows the aspect ratio before load.
type Client = { name: string; logo: string; w: number; invert?: boolean; brightness?: number; opacity?: number; maxWidth?: number; height?: number }

const CLIENTS: Client[] = [
  { name: 'Bella.tw 儂儂',   logo: '/logos/Content Owner/bella.svg',           w: 152 },
  { name: 'CMoney',          logo: '/logos/Content Owner/cmoney.svg',          w: 294, invert: true },
  { name: 'NOWnews',         logo: '/logos/Content Owner/nownews.svg',         w: 164, invert: true },
  { name: 'U-CAR',           logo: '/logos/Content Owner/ucar.svg',            w: 193, invert: true },
  { name: '創業小聚',         logo: '/logos/Content Owner/meet.svg',            w: 167 },
  { name: '數位時代',         logo: '/logos/Content Owner/bnext.svg',           w: 109, invert: true, brightness: 0.5 },
  { name: '東森新聞',         logo: '/logos/Content Owner/ebc.svg',             w: 92 },
  { name: '早安健康',         logo: '/logos/Content Owner/edh.svg',             w: 316 },
  { name: '經理人',           logo: '/logos/Content Owner/managertoday.svg',    w: 159 },
  { name: '未來商務',         logo: '/logos/Content Owner/Group.svg',           w: 218 },
  { name: '聯合新聞網',       logo: '/logos/Content Owner/udn.svg',             w: 209, opacity: 0.7 },
  { name: '股股知識庫',       logo: '/logos/Content Owner/gugu.svg',            w: 249, opacity: 0.7 },
  { name: '遠見雜誌',         logo: '/logos/Content Owner/gvm.svg',             w: 93 },
  { name: '鉅亨網',           logo: '/logos/Content Owner/cnyes.svg',           w: 123 },
  { name: '食力 foodNEXT',    logo: '/logos/Content Owner/foodnext.svg',        w: 50 },
]

function ClientLogo({ name, logo, w, invert, brightness, opacity, maxWidth, height }: Client) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="text-sm font-semibold whitespace-nowrap select-none"
        style={{ color: 'var(--color-ink-subtle)', letterSpacing: '0.01em' }}
      >
        {name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      title={name}
      width={w}
      height={50}
      style={{
        height: height ?? 24,
        width: 'auto',
        objectFit: 'contain',
        filter: grayFilter(invert, brightness, opacity),
        flexShrink: 0,
      }}
      onError={() => setFailed(true)}
    />
  )
}

export function LogoMarquee({ isFixed = false }: { isFixed?: boolean }) {
  const doubled = [...CLIENTS, ...CLIENTS]

  return (
    <div
      className="h-full flex flex-col justify-center md:flex-row md:items-center bg-white"
      style={{
        paddingBottom: 0,
        paddingTop: 0,
      }}
    >
      {/* Label — above on mobile, left on desktop */}
      <div className="flex-shrink-0 flex flex-col items-center md:flex-row md:items-center md:gap-3 md:px-5 mb-1.5 md:mb-0">
        <p
          className="label-eyebrow font-medium whitespace-nowrap"
          style={{ color: 'var(--color-ink-muted)' }}
        >
          Trusted by
        </p>
        <div className="hidden md:block w-px h-4 bg-primary/12" />
      </div>

      {/* Scrolling logos */}
      <div className="flex-1 relative overflow-hidden">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #FFFFFF, transparent)' }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, #FFFFFF, transparent)' }}
        />

        {/* Marquee track */}
        <div className="animate-marquee">
          {doubled.map((client, i) => (
            <ClientLogo key={i} {...client} />
          ))}
        </div>
      </div>
    </div>
  )
}
