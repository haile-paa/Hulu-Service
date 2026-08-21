import Hero from "../components/sections/Hero";
import ProblemStats from "../components/sections/ProblemStats";
import Surfaces from "../components/sections/Surfaces";
import Features from "../components/sections/Features";
import TechStack from "../components/sections/TechStack";
import DownloadBand from "../components/sections/DownloadBand";
import BlogTeaser from "../components/sections/BlogTeaser";

export default function Home() {
  return (
    <>
      <Hero />
      <ProblemStats />
      <Surfaces />
      <Features />
      <TechStack />
      <DownloadBand />
      <BlogTeaser />
    </>
  );
}
