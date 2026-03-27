import React, { useState, useEffect } from 'react';
import { delayRender, continueRender, Img } from 'remotion';

interface ExternalImageProps {
  src: string;
  alt?: string;
  fit?: 'cover' | 'contain';
  className?: string;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  border?: boolean;
}

export const ExternalImage: React.FC<ExternalImageProps> = ({
  src,
  alt = 'External image',
  fit = 'cover',
  className = '',
  rounded = 'none',
  shadow = 'none',
  border = false,
}) => {
  const [handle] = useState(() => delayRender(`Loading image: ${src}`));
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
      continueRender(handle);
    };
    img.onerror = () => {
      setError(`Failed to load image: ${src}`);
      continueRender(handle);
    };
  }, [src, handle]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 border border-red-500/50 text-red-400 p-4 ${className}`}>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return null;
  }

  // Tailwind classes for styling
  const roundedClass = rounded !== 'none' ? `rounded-${rounded}` : '';
  const shadowClass = shadow !== 'none' ? `shadow-${shadow}` : '';
  const borderClass = border ? 'border border-white/10' : '';
  const fitClass = fit === 'cover' ? 'object-cover' : 'object-contain';

  return (
    <div className={`overflow-hidden flex items-center justify-center ${roundedClass} ${shadowClass} ${borderClass} ${className}`}>
      <Img 
        src={src} 
        alt={alt} 
        className={`w-full h-full ${fitClass}`}
      />
    </div>
  );
};
