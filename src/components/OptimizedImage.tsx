import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  priority = false,
  aspectRatio = '3/4',
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden bg-[#f5f5f5] ${className}`}
      style={{ aspectRatio }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f5f5f5] via-[#e8e8e8] to-[#f5f5f5]" />
      )}

      {/* Imagem real */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{
          contentVisibility: 'auto',
        }}
      />

      {/* Fallback para erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f5f5]">
          <div className="text-center text-[#5c0108] p-4">
            <p className="text-sm">Imagem indisponível</p>
          </div>
        </div>
      )}
    </div>
  );
}
