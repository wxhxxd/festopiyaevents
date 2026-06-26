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
          width: "5.5em",
          display: "inline-block",
          verticalAlign: "middle",
        }}
        viewBox="0 0 180 32"
      >
        <text
          x="0"
          y="25"
          className="select-none font-bold"
          style={{
            fontFamily: "var(--font-melfina), sans-serif",
            fontSize: "26px",
            letterSpacing: "-0.03em",
          }}
        >
          <tspan className="dash-f">F</tspan>
          <tspan className="dash-e">e</tspan>
          <tspan className="dash-stopiya">stopiya</tspan>
        </text>
      </svg>
    </span>
  );
}
