export default function MarqueeText({ items, speed = 'animate-marquee', className = '' }) {
  return (
    <div className={`relative overflow-hidden border-y border-line py-4 ${className}`}>
      <div className={`marquee-track ${speed}`}>
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center shrink-0">
            {items.map((item, i) => (
              <span key={`${rep}-${i}`} className="flex items-center font-mono text-[13px] tracking-[0.08em] uppercase text-muted2 px-6 whitespace-nowrap">
                {item}
                <span className="ml-6 text-orange">·</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
