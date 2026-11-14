import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/landing/Hero";
import { Contrast } from "@/components/landing/Contrast";
import { Stats } from "@/components/landing/Stats";
import { Approach } from "@/components/landing/Approach";
import { Programs } from "@/components/landing/Programs";
import { Reasons } from "@/components/landing/Reasons";
import { Mentors } from "@/components/landing/Mentors";
import { Voices } from "@/components/landing/Voices";
import { Visit } from "@/components/landing/Visit";
import { Closing } from "@/components/landing/Closing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cognify Institute, A Thinking Institute for Classes 9–12" },
      { name: "description", content: "Maths, Physics, Chemistry & Economics for Classes 9–12 in South Delhi. Conceptual clarity over rote learning." },
      { property: "og:title", content: "Cognify Institute, Clarity. Confidence. Cognify." },
      { property: "og:description", content: "A thinking institute for Classes 9–12. Maths, Physics, Chemistry & Economics." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Contrast />
      <Stats />
      <Approach />
      <Programs />
      <Reasons />
      <Mentors />
      <Voices />
      <Visit />
      <Closing />
    </>
  );
}
