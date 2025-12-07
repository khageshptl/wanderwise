"use client";
import Hero from "./_components/Hero";
import { PopularCityList } from "./_components/PopularCityList";

export default function Home() {
  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <Hero />
      <PopularCityList />
    </div>
  );
}
