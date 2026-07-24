"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  date: string;
  banner_url?: string;
  image_urls?: string;
  standard_stall_size?: string;
  standard_stall_location?: string;
  standard_price?: number;
  premium_price?: number;
}

interface EventAnimationSliderProps {
  events: EventData[];
  onEventClick: (event: EventData) => void;
}

const CURATED_COLORS = [
  "#14121E", // Dark Midnight Violet
  "#0C1625", // Dark Blue Sapphire
  "#0A1E14", // Deep Emerald
  "#1E0A10", // Rich Wine Burgundy
  "#141416", // Matte Obsidian
];

export default function EventAnimationSlider({ events, onEventClick }: EventAnimationSliderProps) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const sliderRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const titleContainerRef = useRef<HTMLDivElement>(null);

  const [cursorOpacity, setCursorOpacity] = useState(0);
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

  // Helper to generate consistent background color based on name
  const getEventColor = (eventName: string) => {
    let hash = 0;
    for (let i = 0; i < eventName.length; i++) {
      hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % CURATED_COLORS.length;
    return CURATED_COLORS[idx];
  };

  const getRelativeStep = useCallback((idx: number) => {
    if (total === 0) return 0;
    let diff = idx - current;
    // Circular mapping for shortest carousel distance
    if (diff < -total / 2) diff += total;
    if (diff > total / 2) diff -= total;
    return diff;
  }, [current, total]);

  const getSlideProps = useCallback((step: number, containerHeight: number) => {
    const absStep = Math.abs(step);
    
    // Positions corresponding to step: -2, -1, 0, 1, 2
    const positions = [
      { x: -0.35, y: -0.95, rot: -30, s: 1.35, b: 16, o: 0 },   // step = -2 (exited top)
      { x: -0.18, y: -0.5, rot: -15, s: 1.15, b: 8, o: 0.55 },  // step = -1 (back card)
      { x: 0, y: 0, rot: 0, s: 1, b: 0, o: 1 },                 // step = 0 (active card)
      { x: -0.06, y: 0.5, rot: 15, s: 0.75, b: 6, o: 0.55 },    // step = 1 (front card)
      { x: -0.12, y: 0.95, rot: 30, s: 0.55, b: 14, o: 0 }      // step = 2 (exited bottom)
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
    const h = titleEl.offsetHeight || 80;
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
        duration: 0.8,
        ease: "power4.out",
        onComplete: () => {
          setAnimating(false);
        }
      }
    );
  }, [current, total, events, direction]);

  // Animate slides and background on current index change
  useEffect(() => {
    if (total === 0 || !imagesContainerRef.current) return;

    const containerHeight = imagesContainerRef.current.offsetHeight || 350;
    const slides = imagesContainerRef.current.querySelectorAll(".slider__slide");

    // Animate background color transition of slider container
    if (sliderRef.current) {
      gsap.to(sliderRef.current, {
        backgroundColor: getEventColor(events[current]?.name || ""),
        duration: 1,
        ease: "power2.out"
      });
    }

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

  // Keyboard controls, scroll wheel, & cursor hover listeners
  useEffect(() => {
    if (total === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleGo("next");
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handleGo("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [total, handleGo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cursorRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    gsap.to(cursorRef.current, {
      x: x,
      y: y,
      xPercent: -50,
      yPercent: -50,
      duration: 0.2,
      ease: "power2.out"
    });

    if (cursorOpacity === 0) {
      setCursorOpacity(1);
    }
  };

  const handleMouseLeave = () => {
    setCursorOpacity(0);
  };

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
        <Calendar className="w-12 h-12 text-white/20 mb-4" />
        <p className="text-white/60 font-medium">No events found.</p>
      </div>
    );
  }

  const activeEvent = events[current];

  return (
    <section 
      ref={sliderRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="slider"
    >
      {/* Dynamic Cursor tracking bubble */}
      <div 
        ref={cursorRef}
        className="slider__cursor transition-opacity duration-300"
        style={{ opacity: cursorOpacity, pointerEvents: "none" }}
      >
        +
      </div>

      <div className="slider__header">
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => handleGo("prev")}
            className="slider__menu hover:scale-105 transition-transform"
            aria-label="Previous event"
          >
            <ChevronLeft className="w-5 h-5 text-white/80" />
          </button>
          <button 
            type="button"
            onClick={() => handleGo("next")}
            className="slider__menu hover:scale-105 transition-transform"
            aria-label="Next event"
          >
            <ChevronRight className="w-5 h-5 text-white/80" />
          </button>
        </div>
        <span className="slider__label">Discover {current + 1} of {total}</span>
      </div>

      <div className="slider__body">
        <div className="slider__left">
          {/* Active Event title linked to details */}
          <h2 
            ref={titleContainerRef}
            onClick={() => onEventClick(activeEvent)}
            className="slider__title hover:text-pink-400 transition-colors duration-300 cursor-pointer"
            aria-live="polite"
          >
            {activeEvent?.name}
          </h2>
          
          <div className="slider__footer">
            <div className="slider__info">
              <p className="slider__description">
                {activeEvent?.standard_stall_size ? `STALL SIZE: ${activeEvent.standard_stall_size}` : "STALL SIZE: 10x10"}<br />
                {activeEvent?.date ? `DATE: ${activeEvent.date.toUpperCase()}` : "DATE: TBD"}
              </p>
              <p className="slider__location">
                LOC: {activeEvent?.standard_stall_location || "HYDERABAD"}<br />
                {activeEvent?.standard_price ? `STARTING AT ₹${activeEvent.standard_price}` : "PRICE: TBD"}
              </p>
            </div>
          </div>
        </div>

        {/* Carousel Stack Container */}
        <div 
          ref={imagesContainerRef}
          className="slider__right"
        >
          <div className="slider__images">
            {events.map((event, index) => (
              <div
                key={event.id}
                data-index={index}
                onClick={() => onEventClick(event)}
                className="slider__slide cursor-pointer"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0,
                  pointerEvents: index === current ? "auto" : "none" // only click active card
                }}
              >
                <img 
                  src={getEventImage(event)} 
                  alt={event.name} 
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
