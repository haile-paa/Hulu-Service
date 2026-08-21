import { Link } from 'react-router-dom'
import Reveal from '../Reveal'
import { DownloadIcon, TelegramIcon } from '../Icons'

export default function DownloadBand() {
  return (
    <section className="py-20 border-t border-line bg-gradient-to-b from-bg2 to-bg1">
      <div className="wrap">
        <Reveal className="max-w-xl mb-11">
          <span className="stop">get the app</span>
          <h2 className="font-disp font-semibold text-3xl md:text-4xl">Two ways to start — no Play Store needed</h2>
        </Reveal>

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-9 items-start">
          <div className="flex flex-col gap-4.5">
            <Reveal className="card p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-disp font-semibold text-lg">Android APK — direct download</h4>
                  <div className="font-mono text-xs text-muted2 mt-1.5">Sideload · Android 8.0+</div>
                </div>
                <a className="btn btn-primary btn-sm" href="/downloads/hulu-service.apk" download>
                  <DownloadIcon className="w-4 h-4" /> Download .apk
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="card p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-disp font-semibold text-lg">Telegram Mini App</h4>
                  <div className="font-mono text-xs text-muted2 mt-1.5">@Hulu_service_bot · no install</div>
                </div>
                <a className="btn btn-ghost btn-sm" href="https://t.me/Hulu_service_bot" target="_blank" rel="noopener noreferrer">
                  <TelegramIcon className="w-4 h-4" /> Open bot
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15}>
            <Link to="/download" className="btn btn-ghost w-full">Full install guide →</Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
