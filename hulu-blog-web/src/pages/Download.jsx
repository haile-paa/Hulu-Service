import Reveal from '../components/Reveal'
import { DownloadIcon, TelegramIcon } from '../components/Icons'

const steps = [
  {
    title: 'Download the .apk file',
    text: 'Use the button below, on the phone that will run the app. Chrome will show a "file may be harmful" warning — that\u2019s normal for any app installed outside the Play Store.',
  },
  {
    title: 'Allow installs from this source',
    text: 'Android will prompt to enable "Install unknown apps" for your browser. Tap Settings → allow for this app → go back and continue the install.',
  },
  {
    title: 'Tap install, then open',
    text: 'Once installed, open Hulu Service, choose Amharic or English, and sign up as a customer or provider.',
  },
]

export default function Download() {
  return (
    <>
      <section className="pt-16 pb-3">
        <div className="wrap max-w-[760px]">
          <Reveal>
            <span className="stop">get the app</span>
            <h1 className="font-disp font-semibold text-4xl md:text-5xl leading-tight">
              Hulu Service isn't on the Play Store yet — here's how to get it anyway.
            </h1>
            <p className="text-muted text-lg max-w-[52ch] mt-5">
              Two ways in: sideload the Android APK directly from this site, or skip installing anything and open the
              Telegram Mini App.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-14 border-t border-line mt-8">
        <div className="wrap grid md:grid-cols-[1.1fr_0.9fr] gap-10">
          <div className="flex flex-col gap-4.5">
            <Reveal className="card p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-disp font-semibold text-lg">Android APK</h4>
                  <div className="font-mono text-xs text-muted2 mt-1.5">Direct download · Android 8.0+ · sideload</div>
                </div>
                <a className="btn btn-primary btn-sm" href="/downloads/hulu-service.apk" download>
                  <DownloadIcon className="w-4 h-4" /> Download .apk
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="card p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-disp font-semibold text-lg">Telegram Mini App</h4>
                  <div className="font-mono text-xs text-muted2 mt-1.5">@Hulu_service_bot · nothing to install</div>
                </div>
                <a className="btn btn-ghost btn-sm" href="https://t.me/Hulu_service_bot" target="_blank" rel="noopener noreferrer">
                  <TelegramIcon className="w-4 h-4" /> Open bot
                </a>
              </div>
            </Reveal>
            <Reveal delay={0.16} className="card p-7">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <h4 className="font-disp font-semibold text-lg">APK via Telegram channel</h4>
                  <div className="font-mono text-xs text-muted2 mt-1.5">t.me/paDevelopments</div>
                </div>
                <a className="btn btn-ghost btn-sm" href="https://t.me/paDevelopments" target="_blank" rel="noopener noreferrer">
                  Open channel
                </a>
              </div>
            </Reveal>
          </div>

          <div>
            <Reveal><h3 className="font-disp font-semibold text-xl mb-6">Installing the APK on Android</h3></Reveal>
            <ol className="flex flex-col gap-5">
              {steps.map((s, i) => (
                <Reveal key={s.title} delay={0.1 + i * 0.1}>
                  <li className="flex gap-4">
                    <span className="shrink-0 w-[30px] h-[30px] rounded-[9px] bg-orange/15 text-orange font-mono font-semibold text-[13px] flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h5 className="text-[14.5px] font-semibold mb-1">{s.title}</h5>
                      <p className="text-[13.5px] text-muted">{s.text}</p>
                    </div>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-line">
        <div className="wrap">
          <Reveal>
            <span className="stop">why no play store, yet</span>
            <h2 className="font-disp font-semibold text-3xl md:text-4xl max-w-[26ch]">
              Direct distribution, on purpose — for now.
            </h2>
            <p className="text-muted max-w-[60ch] mt-4">
              Hulu Service is an actively developed, independent project — Play Store review, signing, and rollout
              takes time the project isn't ready to spend yet. Distributing the APK directly and through Telegram
              means every fix and feature reaches testers the same day it's built. A Play Store listing is on the
              roadmap once the core booking flow is fully stable.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
