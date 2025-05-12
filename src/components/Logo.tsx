// src/components/Logo.tsx
import { cn } from "@/lib/utils";
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface LogoProps extends Omit<ImageProps, 'src' | 'alt' | 'priority'> {
  iconOnly?: boolean;
  // className is part of ImageProps, so it's implicitly included
}

const Logo = ({ className, iconOnly = false, width, height, ...props }: LogoProps) => {
  const imageSrc = "/logo.png"; // Assumes logo.png is in the public folder
  const altText = "LWV CLINIC E-DOC Logo";

  const imageWidth = width || (iconOnly ? 32 : 200);
  const imageHeight = height || (iconOnly ? 32 : 50);

  return (
    <Image
      src={imageSrc}
      alt={altText}
      width={imageWidth}
      height={imageHeight}
      className={cn("object-contain", className)} // Apply object-contain and merge with passed className
      priority // Preload logo if it's critical for LCP
      {...props}
    />
  );
};

export default Logo;
