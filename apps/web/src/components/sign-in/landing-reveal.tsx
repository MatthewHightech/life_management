"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type LandingParallaxSide = "left" | "right";

type LandingRevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Skip the entrance animation (e.g. hero content already on screen). */
  immediate?: boolean;
  /**
   * Continuous horizontal drift while the section is in view.
   * Omit for fade-in only (e.g. At a glance).
   */
  parallax?: LandingParallaxSide;
};

export function LandingReveal({
  children,
  className,
  immediate = false,
  parallax,
}: LandingRevealProps) {
  const revealRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      return;
    }

    const element = revealRef.current;
    const scroller = element?.closest<HTMLElement>("[data-landing-scroll]");
    if (!element || !scroller) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        root: scroller,
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px",
      },
    );

    observer.observe(element);

    const onMotionPreferenceChange = () => {
      if (reducedMotion.matches) {
        setVisible(true);
        observer.disconnect();
      }
    };

    reducedMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", onMotionPreferenceChange);
    };
  }, [immediate]);

  useEffect(() => {
    if (!parallax) {
      return;
    }

    const element = parallaxRef.current;
    const scroller = element?.closest<HTMLElement>("[data-landing-scroll]");
    if (!element || !scroller) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
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
      const offset = position * 14;
      const horizontal = parallax === "left" ? offset : -offset;

      element.style.transform = `translate3d(${horizontal}px, 0, 0)`;
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
      element.style.removeProperty("transform");
    };
  }, [parallax]);

  return (
    <div
      ref={revealRef}
      className={cn(
        "transform-gpu transition-[opacity,transform] duration-[1800ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
    >
      <div
        ref={parallaxRef}
        className={cn(
          parallax &&
            "transform-gpu will-change-transform transition-transform duration-150 ease-out motion-reduce:transform-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
