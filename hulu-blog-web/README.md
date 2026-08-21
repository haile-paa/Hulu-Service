# Hulu Service — marketing site (React)

React + Vite + Tailwind CSS + Framer Motion + Three.js (react-three-fiber).

## Run locally
npm install
npm run dev        # http://localhost:5173

## Build for production
npm run build       # outputs to dist/
npm run preview     # preview the production build

## Add your real APK
Drop your build at:
  public/downloads/hulu-service.apk
Every "Download .apk" button already links to /downloads/hulu-service.apk — no code changes needed.

## Structure
src/
  components/         shared UI (Navbar, Footer, PhoneFrame, HeroScene (3D), MarqueeText, ScreenshotMarquee, Reveal)
  components/sections/  homepage sections (Hero, ProblemStats, Surfaces, Features, TechStack, DownloadBand, BlogTeaser)
  pages/              route pages (Home, Download, Blog, BlogPost)
  data/blogPosts.js   blog post content — edit here to add/change posts
public/
  brand/              app icon + favicons
  screens/            real app screenshots used throughout the site
  downloads/          put hulu-service.apk here
