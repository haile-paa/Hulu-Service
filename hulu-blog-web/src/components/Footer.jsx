import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-line pt-14 pb-8">
      <div className="wrap">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-8 mb-10">
          <div>
            <Link to="/" className="flex items-center gap-2.5 font-disp font-bold">
              <img src="/brand/icon.png" alt="" className="w-8 h-8 rounded-lg" />
              <span>Hulu Service</span>
            </Link>
            <p className="text-muted text-sm mt-3.5 max-w-[34ch]">
              Ethiopia's local service marketplace — built by PA Dev's. Bilingual, real-time, and available today as a direct APK.
            </p>
          </div>
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-muted2 mb-4">Product</h5>
            <Link className="block text-sm text-muted hover:text-cream mb-2.5" to="/#surfaces">Product</Link>
            <Link className="block text-sm text-muted hover:text-cream mb-2.5" to="/download">Download</Link>
            <Link className="block text-sm text-muted hover:text-cream mb-2.5" to="/blog">Blog</Link>
          </div>
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-muted2 mb-4">App</h5>
            <a className="block text-sm text-muted hover:text-cream mb-2.5" href="https://t.me/Hulu_service_bot" target="_blank" rel="noopener noreferrer">Telegram bot</a>
            <a className="block text-sm text-muted hover:text-cream mb-2.5" href="/downloads/hulu-service.apk" download>Android APK</a>
          </div>
          <div>
            <h5 className="font-mono text-[11.5px] uppercase tracking-[0.06em] text-muted2 mb-4">PA Dev's</h5>
            <a className="block text-sm text-muted hover:text-cream mb-2.5" href="https://github.com/haile-paa" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a className="block text-sm text-muted hover:text-cream mb-2.5" href="https://www.linkedin.com/in/haileyesus-404795264" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a className="block text-sm text-muted hover:text-cream mb-2.5" href="mailto:Haileyesuseyasu@gmail.com">Email</a>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center gap-2.5 pt-6 border-t border-line text-[13px] text-muted2">
          <span>© 2026 PA Dev's. Built in Addis Ababa.</span>
          <span className="font-eth">ሁሉ ሰርቪስ — ሁሉም አገልግሎት በአንድ ቦታ</span>
        </div>
      </div>
    </footer>
  )
}
