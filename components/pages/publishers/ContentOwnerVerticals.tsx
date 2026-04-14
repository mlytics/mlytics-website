const VERTICALS = [
  {
    vertical: 'Finance & Investment',
    logos: [
      { src: '/logos/cnyes.svg', alt: '鉅亨網', w: 80 },
      { src: '/logos/cmoney.png', alt: 'CMoney', w: 80 },
      { src: '/logos/gugu.svg', alt: '股股知識庫', w: 72 },
    ],
  },
  {
    vertical: 'Business & Management',
    logos: [
      { src: '/logos/gvm.png', alt: '遠見雜誌', w: 64 },
      { src: '/logos/managertoday.png', alt: '經理人', w: 80 },
      { src: '/logos/bnext.png', alt: '數位時代', w: 72 },
    ],
  },
  {
    vertical: 'Health & Wellness',
    logos: [
      { src: '/logos/edh.png', alt: '早安健康', w: 80 },
    ],
  },
  {
    vertical: 'Lifestyle & Fashion',
    logos: [
      { src: '/logos/bella.png', alt: 'Bella.tw 儂儂', w: 72 },
    ],
  },
  {
    vertical: 'Automotive',
    logos: [
      { src: '/logos/ucar.png', alt: 'U-CAR', w: 72 },
    ],
  },
  {
    vertical: 'News & Media',
    logos: [
      { src: '/logos/udn.jpg', alt: '聯合新聞網', w: 72 },
      { src: '/logos/nownews.svg', alt: 'NOWnews', w: 80 },
      { src: '/logos/ebc.png', alt: '東森', w: 56 },
    ],
  },
  {
    vertical: 'Food & Agriculture',
    logos: [
      { src: '/logos/foodnext.png', alt: '食力 foodNEXT', w: 88 },
    ],
  },
]

export function ContentOwnerVerticals() {
  return (
    <section className="section-white py-16 lg:py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#225D59' }}
          >
            Trusted By
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Content owners across every vertical
          </h2>
          <p className="text-base leading-relaxed" style={{ color: '#6B6B6B' }}>
            Find someone like you — already running on Decision Engine.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {VERTICALS.map((item, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border"
              style={{ borderColor: '#E5E5E5' }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: '#BBBBBB' }}
              >
                {item.vertical}
              </p>
              <div className="flex flex-wrap items-center gap-5">
                {item.logos.map(logo => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={logo.alt}
                    src={logo.src}
                    alt={logo.alt}
                    style={{ height: 28, width: logo.w, objectFit: 'contain', filter: 'grayscale(1) opacity(0.6)' }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Open slot */}
          <div
            className="p-5 rounded-2xl border flex items-center justify-center"
            style={{ borderColor: 'rgba(34,93,89,0.2)', background: 'rgba(34,93,89,0.03)', borderStyle: 'dashed' }}
          >
            <p className="text-sm font-medium" style={{ color: '#225D59' }}>Your vertical, next.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
