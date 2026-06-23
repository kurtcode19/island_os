import { useState } from 'react';
import { clsx } from 'clsx';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallback?: string;
}

const GRADIENT_FALLBACKS = [
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #f472b6 0%, #db2777 100%)',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function SafeImage({ src, alt, className, wrapperClassName, fallback }: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const gradientIndex = hashString(src) % GRADIENT_FALLBACKS.length;

  if (hasError || !src) {
    return (
      <div
        className={clsx('flex items-center justify-center', wrapperClassName || className)}
        style={{ background: fallback || GRADIENT_FALLBACKS[gradientIndex] }}
      >
        <span className="text-white/40 text-[10px] font-bold tracking-wider uppercase select-none">
          {alt?.charAt(0) || '?'}
        </span>
      </div>
    );
  }

  return (
    <div className={clsx('relative overflow-hidden', wrapperClassName)}>
      {!isLoaded && (
        <div
          className={clsx('absolute inset-0 animate-pulse', wrapperClassName || className)}
          style={{ background: GRADIENT_FALLBACKS[gradientIndex] }}
        />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={clsx(
          'transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
      />
    </div>
  );
}
