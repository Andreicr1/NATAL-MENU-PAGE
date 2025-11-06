import { useState, useEffect, useRef } from 'react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  autoPlay?: boolean;
  interval?: number;
}

export function ImageCarousel({
  images,
  alt,
  autoPlay = true,
  interval = 3000,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload próxima imagem
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    if (!loadedImages.has(nextIndex)) {
      const img = new Image();
      img.src = images[nextIndex];
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(nextIndex));
      };
    }
  }, [currentIndex, images, loadedImages]);

  // Se houver apenas uma imagem, não mostrar controles
  const singleImage = images.length === 1;

  useEffect(() => {
    if (!autoPlay || singleImage) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length, singleImage]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Handlers para touch/swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && !singleImage) {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }
    if (isRightSwipe && !singleImage) {
      setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#f5f5f5]"
      role="region"
      aria-roledescription="carousel"
      aria-label={`Carrossel de imagens de ${alt}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Skeleton loader */}
      {!loadedImages.has(currentIndex) && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f5f5f5] via-[#e8e8e8] to-[#f5f5f5]" />
      )}

      {/* Imagem atual */}
      <img
        src={images[currentIndex]}
        alt={`${alt} - Imagem ${currentIndex + 1} de ${images.length}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loadedImages.has(currentIndex) ? 'opacity-100' : 'opacity-0'
        }`}
        loading={currentIndex === 0 ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoadedImages(prev => new Set(prev).add(currentIndex))}
        style={{ touchAction: 'pan-y pinch-zoom' }}
      />

      {/* Indicadores (só aparecem se houver múltiplas imagens) */}
      {!singleImage && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white/50 ${
                index === currentIndex
                  ? 'bg-white w-2 h-2'
                  : 'bg-white/50 w-2 h-2 hover:bg-white/75'
              }`}
              aria-label={`Ir para imagem ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
