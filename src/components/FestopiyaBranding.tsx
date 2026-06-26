import React from "react";

interface FestopiyaBrandingProps {
  className?: string;
  isLanding?: boolean;
}

export default function FestopiyaBranding({ className = "", isLanding = false }: FestopiyaBrandingProps) {
  return (
    <span className="inline-flex items-center align-middle">
      <svg
        className={`select-none overflow-visible ${className}`}
        style={{
          height: "1.1em",
          width: "6.2em",
          display: "inline-block",
          verticalAlign: "middle",
        }}
        viewBox="0 0 180 32"
      >
        <defs>
          <linearGradient id="shimmer-F" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#ffb3d9" />
            <stop offset="100%" stopColor="#f472b6" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
          <linearGradient id="shimmer-e" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#38bdf8" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
          <linearGradient id="shimmer-stopiya" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#ffffff" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur="2.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="25"
          textAnchor="middle"
          className="select-none"
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: "26px",
            letterSpacing: "-0.03em",
          }}
        >
          <tspan
            style={{
              fill: "url(#shimmer-F)",
            }}
          >F</tspan><tspan
            style={{
              fill: "url(#shimmer-e)",
            }}
          >e</tspan><tspan
            style={{
              fill: "url(#shimmer-stopiya)",
            }}
          >stopiya</tspan>
        </text>
      </svg>
    </span>
  );
}
