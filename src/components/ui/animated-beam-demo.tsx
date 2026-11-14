"use client";

import React, { forwardRef, useRef } from "react";
import { Atom, BrainCircuit, Calculator, FileText, FlaskConical, GraduationCap, Mic2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border-2 border-navy/30 bg-card p-3 text-navy shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
          className,
        )}
      >
        {children}
      </div>
    );
  },
);

Circle.displayName = "Circle";

/* Subjects on the left and Cognify's tools on the right, all flowing into Cognify at the centre. */
export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const div1Ref = useRef<HTMLDivElement>(null);
  const div2Ref = useRef<HTMLDivElement>(null);
  const div3Ref = useRef<HTMLDivElement>(null);
  const div4Ref = useRef<HTMLDivElement>(null);
  const div5Ref = useRef<HTMLDivElement>(null);
  const div6Ref = useRef<HTMLDivElement>(null);
  const div7Ref = useRef<HTMLDivElement>(null);

  const beam = { containerRef, toRef: div4Ref, pathColor: "#112D57", gradientStartColor: "#112D57", gradientStopColor: "#7A1230" };

  return (
    <div
      className="relative flex h-[500px] w-full items-center justify-center overflow-hidden rounded-lg border bg-background p-10 md:shadow-xl"
      ref={containerRef}
    >
      <div className="flex size-full max-h-[200px] max-w-lg flex-col items-stretch justify-between gap-10">
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div1Ref}>
            <Calculator aria-label="Maths" />
          </Circle>
          <Circle ref={div5Ref}>
            <BrainCircuit aria-label="NOAH" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div2Ref}>
            <Atom aria-label="Physics" />
          </Circle>
          <Circle ref={div4Ref} className="size-16">
            <GraduationCap className="size-full" aria-label="Cognify" />
          </Circle>
          <Circle ref={div6Ref}>
            <Mic2 aria-label="Viva bot" />
          </Circle>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Circle ref={div3Ref}>
            <FlaskConical aria-label="Chemistry" />
          </Circle>
          <Circle ref={div7Ref}>
            <FileText aria-label="PYQs" />
          </Circle>
        </div>
      </div>

      <AnimatedBeam {...beam} fromRef={div1Ref} curvature={-75} endYOffset={-10} />
      <AnimatedBeam {...beam} fromRef={div2Ref} />
      <AnimatedBeam {...beam} fromRef={div3Ref} curvature={75} endYOffset={10} />
      <AnimatedBeam {...beam} fromRef={div5Ref} curvature={-75} endYOffset={-10} reverse />
      <AnimatedBeam {...beam} fromRef={div6Ref} reverse />
      <AnimatedBeam {...beam} fromRef={div7Ref} curvature={75} endYOffset={10} reverse />
    </div>
  );
}
