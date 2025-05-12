// src/components/Logo.tsx
import { cn } from "@/lib/utils";
import Image from 'next/image';
import type { ImageProps } from 'next/image';

interface LogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  iconOnly?: boolean;
  className?: string;
}

const Logo = ({ className, iconOnly = false, width, height, ...props }: LogoProps) => {
  const imageSrc = "/logo.png"; // Assumes logo.png is in the public folder
  const altText = "LWV CLINIC E-DOC Logo";

  if (iconOnly) {
    return (
      <Image
        src={imageSrc}
        alt={altText}
        width={width || 32} // Default icon size
        height={height || 32} // Default icon size
        className={cn(className)}
        priority // Preload logo if it's critical for LCP
        {...props}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={altText}
      width={width || 200} // Default full logo width
      height={height || 50}  // Default full logo height (adjust based on actual image aspect ratio)
      className={cn(className)}
      priority
      style={{ objectFit: 'contain' }} // Ensures the image scales correctly within bounds
      {...props}
    />
  );
};

export default Logo;
