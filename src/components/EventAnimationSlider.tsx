"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

interface EventData {
  id: string;
  name: string;
  date: string;
  banner_url?: string;
  image_urls?: string;
  standard_stall_size?: string;
  standard_stall_location?: string;
  standard_price?: number;
}

interface EventAnimationSliderProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
}

const GLOW_COLORS = [
  "#f472b6", // Pink glow
  "#38bdf8", // Sky blue glow
  "#a78bfa", // Purple glow
  "#fb7185", // Rose glow
  "#34d399", // Emerald glow
];

export default function EventAnimationSlider({ events, onEventClick }: EventAnimationSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const sliderRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);
  const total = events.length;

  // Helper to safely parse image URLs
  const getEventImage = (event: EventData) => {
    if (event.banner_url) return event.banner_url;
    if (event.image_urls) {
      try {
        const parsed = typeof event.image_urls === "string" ? JSON.parse(event.image_urls) : event.image_urls;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch (e) {
        console.error("Failed to parse image urls", e);
      }
    }
    return "/default-banner.png";
  };

  // Helper to generate consistent color based on name
  const getEventGlowColor = (eventName: string) => {
    let hash = 0;
    for (let i = 0; i < eventName.length; i++) {
      hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % GLOW_COLORS.length;
    return GLOW_COLORS[idx];
  };

  const getRelativeStep = useCallback((idx: number) => {
    if (total === 0) return 0;
    let diff = idx - current;
    // Circular mapping for shortest carousel distance
    if (diff < -total / 2) diff += total;
    if (diff > total / 2) diff -= total;
    return diff;
  }, [current, total]);

  // Exact wheel positioning metrics from original script
  const getSlideProps = useCallback((step: number, containerHeight: number) => {
    const absStep = Math.abs(step);
    
    // Positions corresponding to step: -2, -1, 0, 1, 2
    const positions = [
      { x: -0.35, y: -0.95, rot: -30, s: 1.35, b: 16, o: 0 },    // step = -2 (exited top)
      { x: -0.18, y: -0.5, rot: -15, s: 1.15, b: 8, o: 0.55 },   // step = -1 (back card)
      { x: 0, y: 0, rot: 0, s: 1, b: 0, o: 1 },                  // step = 0 (active card)
      { x: -0.06, y: 0.5, rot: 15, s: 0.75, b: 6, o: 0.55 },     // step = 1 (front card)
      { x: -0.12, y: 0.95, rot: 30, s: 0.55, b: 14, o: 0 }       // step = 2 (exited bottom)
    ];

    const idx = Math.max(0, Math.min(4, step + 2));
    const p = positions[idx];

    return {
      x: p.x * containerHeight,
      y: p.y * containerHeight,
      rotation: p.rot,
      scale: p.s,
      blur: p.b,
      opacity: p.o,
      zIndex: absStep === 0 ? 3 : absStep === 1 ? 2 : 1
    };
  }, []);

  const startAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) clearInterval(autoPlayTimer.current);
    autoPlayTimer.current = setInterval(() => {
      handleGo("next");
    }, 4500);
  }, [total, current, animating]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimer.current) {
      clearInterval(autoPlayTimer.current);
      autoPlayTimer.current = null;
    }
  }, []);

  const handleGo = useCallback((dir: "next" | "prev") => {
    if (animating || total <= 1) return;
    setAnimating(true);
    setDirection(dir);
    
    const nextIdx = dir === "next" 
      ? (current + 1) % total 
      : (current - 1 + total) % total;

    setCurrent(nextIdx);
  }, [current, animating, total]);

  // Handle title text stagger animation inside useEffect
  useEffect(() => {
    if (total === 0 || !titleContainerRef.current) return;

    const titleEl = titleContainerRef.current;
    const activeEventName = events[current]?.name || "";
    const h = titleEl.offsetHeight || 60;
    const dirSign = direction === "next" ? 1 : -1;

    // Clear old text container
    titleEl.innerHTML = "";
    
    // Create line container
    const lineDiv = document.createElement("div");
    lineDiv.style.cssText = "display: inline-block; position: relative;";
    
    [...activeEventName].forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00A0" : char;
      span.style.cssText = "display: inline-block; will-change: transform;";
      lineDiv.appendChild(span);
    });
    
    titleEl.appendChild(lineDiv);

    const chars = lineDiv.querySelectorAll("span");
    gsap.fromTo(
      chars,
      { y: h * dirSign * 0.8, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.03,
        duration: 0.7,
        ease: "power4.out",
        onComplete: () => {
          setAnimating(false);
        }
      }
    );
  }, [current, total, events, direction]);

  // Animate slides on current index change
  useEffect(() => {
    if (total === 0 || !imagesContainerRef.current) return;

    const containerHeight = imagesContainerRef.current.offsetHeight || 300;
    const slides = imagesContainerRef.current.querySelectorAll(".slider__slide");

    slides.forEach((slide) => {
      const idxAttr = slide.getAttribute("data-index");
      if (idxAttr === null) return;
      const idx = parseInt(idxAttr, 10);
      const step = getRelativeStep(idx);
      
      const props = getSlideProps(step, containerHeight);

      // Animate card positions
      gsap.to(slide, {
        x: props.x,
        y: props.y,
        xPercent: -50,
        yPercent: -50,
        rotation: props.rotation,
        scale: props.scale,
        opacity: props.opacity,
        filter: `blur(${props.blur}px)`,
        zIndex: props.zIndex,
        duration: 0.9,
        ease: "power3.inOut"
      });
    });

    startAutoPlay();
    return () => stopAutoPlay();
  }, [current, total, events, getRelativeStep, getSlideProps, startAutoPlay, stopAutoPlay]);

  // Scoped Wheel & Touch Scroll Events to Slider container
  useEffect(() => {
    if (total === 0 || !sliderRef.current) return;

    const sliderEl = sliderRef.current;

    // Wheel throttle helper
    let lastTime = 0;
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastTime < 1800) return;
      if (animating) return;
      
      if (Math.abs(e.deltaY) > 5) {
        handleGo(e.deltaY > 0 ? "next" : "prev");
        lastTime = now;
      }
    };

    // Swipe helpers
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTime < 1800) return;
      if (animating) return;

      const diff = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;

      handleGo(diff > 0 ? "next" : "prev");
      lastTime = now;
    };

    sliderEl.addEventListener("wheel", onWheel, { passive: true });
    sliderEl.addEventListener("touchstart", onTouchStart, { passive: true });
    sliderEl.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      sliderEl.removeEventListener("wheel", onWheel);
      sliderEl.removeEventListener("touchstart", onTouchStart);
      sliderEl.removeEventListener("touchend", onTouchEnd);
    };
  }, [total, handleGo, animating]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[350px] border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
        <span className="text-white/60 font-medium">No events found.</span>
      </div>
    );
  }

  const activeEvent = events[current];

  return (
    <section 
      ref={sliderRef}
      className="w-full h-[380px] sm:h-[450px] md:h-[550px] relative flex flex-row items-center justify-between select-none bg-transparent"
    >
      {/* Pure CSS Radial Gradient Glow Aura (Fixes WebKit/Safari blur clipping box artifact) */}
      <div 
        className="absolute right-0 top-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full pointer-events-none z-0 transition-all duration-1000"
        style={{ 
          background: `radial-gradient(circle, ${getEventGlowColor(activeEvent?.name || "")}44 0%, rgba(0,0,0,0) 70%)` 
        }}
      />

      {/* Left side: Name */}
      <div className="w-[45%] flex items-center justify-start z-10 pl-2 sm:pl-8">
        <h2 
          ref={titleContainerRef}
          onClick={() => onEventClick(activeEvent)}
          className="font-black text-white hover:text-pink-400 transition-colors duration-300 cursor-pointer uppercase tracking-tight leading-none text-2xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl select-none"
          aria-live="polite"
        >
          {activeEvent?.name}
        </h2>
      </div>

      {/* Right side: Image Stack */}
      <div 
        ref={imagesContainerRef}
        className="w-[55%] h-full relative flex items-center justify-center z-10"
      >
        <div className="w-full h-full relative">
          {events.map((event, index) => (
            <div
              key={event.id}
              data-index={index}
              onClick={() => onEventClick(event)}
              className="slider__slide absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] sm:w-[65%] aspect-ratio-1.4 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-2xl cursor-pointer"
              style={{
                opacity: 0,
                pointerEvents: index === current ? "auto" : "none"
              }}
            >
              <img 
                src={getEventImage(event)} 
                alt={event.name} 
                className="w-full h-full object-cover filter brightness-90"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
