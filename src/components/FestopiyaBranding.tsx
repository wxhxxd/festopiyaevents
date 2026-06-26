import React from "react";

interface FestopiyaBrandingProps {
  className?: string;
  isLanding?: boolean;
}

export default function FestopiyaBranding({ className = "", isLanding = false }: FestopiyaBrandingProps) {
  const gradientId = isLanding ? "fe-grad-landing" : "fe-grad-normal";

  return (
    <span className="inline-flex items-center align-middle">
      <svg
        className={`select-none overflow-visible ${className}`}
        style={{
          height: "1.1em",
          width: "5.5em",
          display: "inline-block",
          verticalAlign: "middle",
        }}
        viewBox="0 0 180 32"
      >
        <defs>
          {isLanding ? (
            <linearGradient id="fe-grad-landing" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
              <stop offset="50%" stopColor="#bae6fd" /> {/* sky-200 */}
              <stop offset="100%" stopColor="#67e8f9" /> {/* cyan-300 */}
            </linearGradient>
          ) : (
            <linearGradient id="fe-grad-normal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" /> {/* sky-400 */}
              <stop offset="100%" stopColor="#67e8f9" /> {/* cyan-300 */}
            </linearGradient>
          )}
        </defs>
        <text
          x="0"
          y="25"
          className="font-festopiya font-extrabold select-none"
          style={{
            fontSize: "26px",
            letterSpacing: "-0.03em",
          }}
        >
          <tspan
            className="dash"
            style={{
              fill: "rgba(56, 189, 248, 0.08)",
              stroke: `url(#${gradientId})`,
              strokeWidth: "1.5px",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            Fe
          </tspan>
          <tspan
            className="dash"
            style={{
              fill: "rgba(255, 255, 255, 0.08)",
              stroke: "#ffffff",
              strokeWidth: "1.5px",
              strokeLinecap: "round",
              strokeLinejoin: "round",
            }}
          >
            stopiya
          </tspan>
        </text>
      </svg>
    </span>
  );
}
