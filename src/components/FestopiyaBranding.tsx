import React from "react";

interface FestopiyaBrandingProps {
  className?: string;
  isLanding?: boolean;
}

export default function FestopiyaBranding({ className = "", isLanding = false }: FestopiyaBrandingProps) {
  // Use a slightly lighter gradient for the landing page to match the hero background contrast
  const skyGradientClass = isLanding
    ? "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-cyan-300"
    : "text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300";

  return (
    <span className={`font-festopiya font-extrabold tracking-tight select-none ${className}`}>
      {/* Festop */}
      <span className={skyGradientClass}>Festop</span>
      
      {/* Custom styled letter 'i' */}
      <span className="relative inline-block select-none align-baseline">
        {/* Stem of the 'i' (Clipped to show only the bottom part) */}
        <span
          className={`inline-block ${skyGradientClass}`}
          style={{ clipPath: "inset(28% 0 0 0)" }}
        >
          i
        </span>
        {/* Dot of the 'i' (Clipped to show only the top part, colored pink) */}
        <span
          className="absolute inset-0 inline-block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400"
          style={{ clipPath: "inset(0 0 72% 0)" }}
        >
          i
        </span>
      </span>
      
      {/* ya */}
      <span className={skyGradientClass}>ya</span>
    </span>
  );
}
