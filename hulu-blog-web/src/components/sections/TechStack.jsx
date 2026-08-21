import Reveal from '../Reveal'
import MarqueeText from '../MarqueeText'

const lines = [
  { k: 'backend', v: 'Go · Gin · MongoDB' },
  { k: 'realtime', v: 'WebSockets (driver & chat channels)' },
  { k: 'mobile', v: 'React Native · Expo · TypeScript' },
  { k: 'admin', v: 'React web dashboard' },
  { k: 'mini-app', v: 'Telegram Mini App' },
  { k: 'auth', v: 'JWT, role-based (customer / provider)' },
]

const chips = [
  { role: 'Backend', name: 'Go + Gin' },
  { role: 'Database', name: 'MongoDB' },
  { role: 'Mobile', name: 'Expo / RN' },
  { role: 'Distribution', name: 'Telegram + APK' },
]

const ticker = ['GO', 'GIN', 'MONGODB', 'REACT NATIVE', 'EXPO', 'WEBSOCKETS', 'TELEGRAM MINI APP', 'JWT AUTH']

export default function TechStack() {
  return (
    <section className="py-20 border-t border-line">
      <div className="wrap">
        <Reveal className="max-w-xl mb-11">
          <span className="stop">under the hood</span>
          <h2 className="font-disp font-semibold text-3xl md:text-4xl">The stack, for the curious</h2>
          <p className="text-muted mt-3.5 text-[1.02rem]">
            Same stack across every PA Dev's project — chosen for cheap hosting, fast real-time updates, and a
            mobile build pipeline that ships to Android without a Play Store review cycle.
          </p>
        </Reveal>

        <Reveal className="rounded-[18px] border border-line2 bg-[#050f0d] overflow-hidden">
          <div className="flex gap-1.5 px-4.5 py-3.5 border-b border-line">
            <span className="w-2.5 h-2.5 rounded-full bg-line2" />
            <span className="w-2.5 h-2.5 rounded-full bg-line2" />
            <span className="w-2.5 h-2.5 rounded-full bg-line2" />
          </div>
          <div className="px-7 py-7 font-mono text-[13.5px]">
            {lines.map((l) => (
              <div key={l.k} className="mb-2.5 text-muted last:mb-0">
                <span className="text-teal">{l.k}</span> → <span className="text-cream">{l.v}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7">
          {chips.map((c, i) => (
            <Reveal key={c.role} delay={i * 0.08} className="card rounded-xl p-4.5">
              <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted2">{c.role}</div>
              <div className="font-disp font-semibold mt-1.5">{c.name}</div>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-14">
        <MarqueeText items={ticker} />
      </div>
    </section>
  )
}
