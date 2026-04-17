'use client'

import { useState } from 'react'

// grayscale(1): removes color. opacity controls visibility.
// invert(1) is prepended for logos designed as white-on-dark (e.g. CMoney).
// brightness adjusts individual logo darkness (default 1, lower = darker).
const grayFilter = (invert = false, brightness = 1, opacity = 0.5) =>
  `${invert ? 'invert(1) ' : ''}grayscale(1) brightness(${brightness}) opacity(${opacity})`

type Client = { name: string; logo: string; invert?: boolean; brightness?: number; opacity?: number; maxWidth?: number; height?: number }

const CLIENTS: Client[] = [
  { name: 'Bella.tw 儂儂',   logo: '/logos/Content Owner/bella.svg' },
  { name: 'CMoney',          logo: '/logos/Content Owner/cmoney.svg',          invert: true },
  { name: 'NOWnews',         logo: '/logos/Content Owner/nownews.svg',         invert: true },
  { name: 'U-CAR',           logo: '/logos/Content Owner/ucar.svg',            invert: true },
  { name: '創業小聚',         logo: '/logos/Content Owner/meet.svg' },
  { name: '數位時代',         logo: '/logos/Content Owner/bnext.svg',           invert: true, brightness: 0.5 },
  { name: '東森新聞',         logo: '/logos/Content Owner/ebc.svg' },
  { name: '早安健康',         logo: '/logos/Content Owner/edh.svg' },
  { name: '經理人',           logo: '/logos/Content Owner/managertoday.svg' },
  { name: '未來商務',         logo: '/logos/Content Owner/Group.svg' },
  { name: '聯合新聞網',       logo: '/logos/Content Owner/udn.svg',            opacity: 0.7 },
  { name: '股股知識庫',       logo: '/logos/Content Owner/gugu.svg',           opacity: 0.7 },
  { name: '遠見雜誌',         logo: '/logos/Content Owner/gvm.svg' },
  { name: '鉅亨網',           logo: '/logos/Content Owner/cnyes.svg' },
  { name: '食力 foodNEXT',    logo: '/logos/Content Owner/foodnext.svg' },
]

function ClientLogo({ name, logo, invert, brightness, opacity, maxWidth, height }: Client) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        className="text-sm font-semibold whitespace-nowrap select-none"
        style={{ color: '#CACACA', letterSpacing: '0.01em' }}
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

export function LogoMarquee() {
  const doubled = [...CLIENTS, ...CLIENTS]

  return (
    <div
      className="h-full flex flex-col justify-center md:flex-row md:items-center"
      style={{ background: '#FFFFFF' }}
    >
      {/* Label — above on mobile, left on desktop */}
      <div className="flex-shrink-0 flex flex-col items-center md:flex-row md:items-center md:gap-3 md:px-5 mb-1.5 md:mb-0">
        <p
          className="text-[11px] font-medium uppercase tracking-widest whitespace-nowrap"
          style={{ color: '#C8C8C8' }}
        >
          Trusted by
        </p>
        <div className="hidden md:block w-px h-4" style={{ background: 'rgba(34,93,89,0.12)' }} />
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
