// src/components/Logo.tsx
import { cn } from "@/lib/utils";
import React from 'react';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
}

const Logo = ({ className, iconOnly = false, ...props }: LogoProps) => {
  const lifeColor = "#8BC34A"; // Approximate green
  const weaversColor = "#2196F3"; // Approximate blue
  const docColor = "#FFB300"; // Approximate orange/yellow

  if (iconOnly) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        className={cn("fill-current", className)}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Lifeweaver Logo"
        {...props}
      >
        <path d="M20 80 L20 20 L35 20 L35 50 L50 50 L50 20 L65 20 L65 80 L50 80 L50 60 L35 60 L35 80 Z" fill={lifeColor} />
        <path d="M70 20 Q70 50 85 50 Q70 50 70 80 L80 80 Q80 50 95 50 Q80 50 80 20 Z" fill={weaversColor} opacity="0.7"/>
      </svg>
    );
  }


  return (
    <svg
      viewBox="0 0 400 100"
      className={cn("fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Lifeweaver Electronic Documentation Logo"
      {...props}
    >
      <style>
        {`
          .logo-font { font-family: 'Arial', sans-serif; font-weight: bold; }
          .tagline-font { font-family: 'Arial', sans-serif; }
        `}
      </style>
      
      {/* Lifeweavers */}
      <text x="10" y="50" className="logo-font" fontSize="48">
        <tspan fill={lifeColor}>Life</tspan>
        <tspan fill={weaversColor} dx="-5">
          w<tspan baselineShift="-0.1em" fontSize="0.8em" dx="-2">e</tspan>av
          <tspan baselineShift="0.1em" fontSize="0.8em" dx="-2">e</tspan>rs
        </tspan>
      </text>

      {/* electronicdocumentation */}
      <text x="15" y="80" className="tagline-font" fontSize="20" fill={docColor}>
        electronicdocumentation
      </text>

      {/* Simplified Icon for small displays if iconOnly is not enough control via parent */}
       <g className="sm:hidden"> {/* Example: Hide text on very small SVG containers if needed */}
         <path d="M10 90 L10 70 L17.5 70 L17.5 80 L25 80 L25 70 L32.5 70 L32.5 90 L25 90 L25 82.5 L17.5 82.5 L17.5 90 Z" fill={lifeColor} transform="scale(0.5) translate(330 20)" />
         <path d="M35 70 Q35 80 42.5 80 Q35 80 35 90 L40 90 Q40 80 47.5 80 Q40 80 40 70 Z" fill={weaversColor} opacity="0.7" transform="scale(0.5) translate(330 20)"/>
       </g>
    </svg>
  );
};

export default Logo;
