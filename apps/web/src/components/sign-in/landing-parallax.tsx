"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

type LandingParallaxProps = {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  maxOffset?: number;
};

type SectionMotionVariant = "lift" | "slide-left" | "slide-right" | "focus";

type LandingSectionFocusProps = {
  children: React.ReactNode;
  className?: string;
  variant?: SectionMotionVariant;
};

function sectionTransform(
  variant: SectionMotionVariant,
  position: number,
  scale: number,
) {
  const vertical = position * 22;
  const horizontal = position * 30;

  if (variant === "slide-left") {
    return `translate3d(${horizontal}px, ${vertical * 0.45}px, 0) scale(${scale})`;
  }
  if (variant === "slide-right") {
    return `translate3d(${-horizontal}px, ${vertical * 0.45}px, 0) scale(${scale})`;
  }
  if (variant === "focus") {
    return `translate3d(0, ${vertical * 0.35}px, 0) scale(${scale - 0.006})`;
  }
  return `translate3d(0, ${vertical}px, 0) scale(${scale})`;
}

export function LandingSectionFocus({
  children,
  className,
  variant = "lift",
}: LandingSectionFocusProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const scroller = element?.closest<HTMLElement>("[data-landing-scroll]");
    if (!element || !scroller) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        element.style.removeProperty("opacity");
        element.style.removeProperty("transform");
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportCenter = scroller.clientHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const position = Math.max(
        -1,
        Math.min(1, (elementCenter - viewportCenter) / scroller.clientHeight),
      );
      const distance = Math.abs(position);
      const scale = 1 - distance * 0.018;

      element.style.opacity = `${1 - distance * 0.16}`;
      element.style.transform = sectionTransform(variant, position, scale);
    };

    const scheduleUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [variant]);

  return (
    <div
      ref={ref}
      className={cn(
        "transform-gpu transition-[transform,opacity] duration-150 ease-out motion-reduce:transform-none motion-reduce:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LandingParallax({
  children,
  className,
  speed = 0.04,
  maxOffset = 24,
}: LandingParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const scroller = element?.closest<HTMLElement>("[data-landing-scroll]");
    if (!element || !scroller) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        element.style.transform = "";
        return;
      }

      const rect = element.getBoundingClientRect();
      const distanceFromCenter =
        scroller.clientHeight / 2 - (rect.top + rect.height / 2);
      const offset = Math.max(
        -maxOffset,
        Math.min(maxOffset, distanceFromCenter * speed),
      );
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    };

    const scheduleUpdate = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    scroller.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      scroller.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [maxOffset, speed]);

  return (
    <div
      ref={ref}
      className={cn(
        "transform-gpu transition-transform duration-100 ease-out motion-reduce:transform-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
