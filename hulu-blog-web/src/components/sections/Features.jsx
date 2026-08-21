// import Reveal from "../Reveal";
import FeatureRow from "./FeatureRow";
import ScreenshotMarquee from "../ScreenshotMarquee";

const features = [
  {
    tag: "Onboarding",
    ethTag: "ደንበኛ / ባለሙያ",
    title: "Pick a role, pick a language",
    text: "One toggle decides whether you're signing up as a customer or a provider. Amharic and English are supported through the entire flow, and providers set their own skills, service areas and hourly rate at signup.",
    points: [
      "Customer or provider, one form",
      "Amharic ↔ English, switch anytime",
    ],
    img: "/screens/signup.jpg",
    alt: "Sign up screen asking customer or provider, in Amharic",
  },
  {
    tag: "Discovery",
    ethTag: "አገልግሎቶች",
    title: "Browse by category, filtered by neighborhood",
    text: '15+ categories — electrician, plumber, cleaner, tutor, mechanic and more — with a location chip pinned to the customer\u2019s area, so "nearby favorites" actually means nearby.',
    points: ["Search by category or keyword", 'Live "available now" providers'],
    img: "/screens/search-location.jpg",
    alt: "Home screen with location, search bar and 15 service categories",
    reverse: true,
  },
  {
    tag: "Real-time",
    ethTag: "መልእክት",
    title: "Message or call, no phone-number swap needed",
    text: "Every booking opens a real-time chat over WebSockets, so customer and provider can confirm details, share a location pin, or just say they\u2019re running late — without exchanging personal numbers first.",
    points: [
      "Instant delivery over WebSockets",
      "One tap to call when it\u2019s urgent",
    ],
    img: "/screens/chat.jpg",
    alt: "Real-time chat between customer and provider inside the app",
  },
  {
    tag: "Trust",
    ethTag: "መገለጫ",
    title: "Verified badges, rates and ratings up front",
    text: "Providers carry a visible verification badge, their hourly rate in Birr, and a star rating once jobs are completed — so a customer knows who they\u2019re booking before the first message is sent.",
    points: [
      "Admin-verified provider badge",
      "Rate in Birr, work areas & ratings",
    ],
    img: "/screens/profile-provider.jpg",
    alt: "Provider profile screen showing verified badge, rate and work areas",
    reverse: true,
  },
];

export default function Features() {
  return (
    <section className='py-20 border-t border-line'>
      {/* <div className='wrap'>
        <Reveal className='max-w-xl mb-8'>
          <span className='stop'>what it's actually like to use</span>
          <h2 className='font-disp font-semibold text-3xl md:text-4xl'>
            Every screen, in the language you booked it in
          </h2>
        </Reveal>
      </div>

      <div className='mb-14'>
        <ScreenshotMarquee />
      </div> */}

      <div className='wrap'>
        {features.map((f) => (
          <FeatureRow key={f.title} {...f} />
        ))}
      </div>
    </section>
  );
}
