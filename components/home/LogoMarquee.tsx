'use client'

import { useState } from 'react'

const DEFAULT_FILTER = 'grayscale(1) brightness(1.5) opacity(0.5)'

type Client = { name: string; logo: string; filter?: string; maxWidth?: number; height?: number }

const CLIENTS: Client[] = [
  { name: 'Bella.tw 儂儂',   logo: '/logos/bella.png' },
  { name: 'CMoney',          logo: '/logos/cmoney.png' },
  { name: 'NOWnews',         logo: '/logos/nownews.svg', filter: 'grayscale(1) brightness(0.65) opacity(0.6)' },
  { name: 'U-CAR',           logo: '/logos/ucar.png' },
  { name: '創業小聚',         logo: '/logos/meet.png' },
  { name: '數位時代',         logo: '/logos/bnext.png', filter: 'grayscale(1) brightness(0.8) opacity(0.6)' },
  { name: '東森娛樂',         logo: '/logos/ebc.png',   height: 22, maxWidth: 140 },
  { name: '早安健康',         logo: '/logos/edh.png' },
  { name: '經理人',           logo: '/logos/managertoday.png' },
  { name: '未來商務',         logo: '/logos/fc.svg' },
  { name: '聯合新聞網',       logo: '/logos/udn.jpg' },
  { name: '股股知識庫',       logo: '/logos/gugu.svg' },
  { name: '遠見雜誌',         logo: '/logos/gvm.png' },
  { name: '鉅亨網',           logo: '/logos/cnyes.svg' },
  { name: '食力 foodNEXT',    logo: '/logos/foodnext.png' },
]

function ClientLogo({ name, logo, filter, maxWidth, height }: { name: string; logo: string; filter?: string; maxWidth?: number; height?: number }) {
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
        height: height ?? 28,
        width: 'auto',
        maxWidth: maxWidth ?? 130,
        objectFit: 'contain',
        filter: filter ?? DEFAULT_FILTER,
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
            <ClientLogo key={i} name={client.name} logo={client.logo} filter={client.filter} maxWidth={client.maxWidth} height={client.height} />
          ))}
        </div>
      </div>
    </div>
  )
}
