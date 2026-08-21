const shots = [
  { src: '/screens/signup.jpg', alt: 'Sign up screen' },
  { src: '/screens/search-location.jpg', alt: 'Home categories screen' },
  { src: '/screens/chat.jpg', alt: 'Real-time chat screen' },
  { src: '/screens/profile-provider.jpg', alt: 'Provider profile screen' },
  { src: '/screens/home-categories.jpg', alt: 'Category browse screen' },
]

export default function ScreenshotMarquee() {
  return (
    <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="marquee-track animate-marqueeSlow">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-end gap-7 shrink-0 pr-7">
            {shots.map((s, i) => (
              <div
                key={`${rep}-${i}`}
                className="w-[150px] rounded-[26px] border-[5px] border-[#06120f] bg-black overflow-hidden shadow-[0_20px_50px_-16px_rgba(0,0,0,0.6)]"
              >
                <img src={s.src} alt={s.alt} className="w-full block" loading="lazy" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
