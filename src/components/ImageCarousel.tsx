import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
        setLoadedImages((prev: Set<number>) => new Set(prev).add(nextIndex));
      };
    }
  }, [currentIndex, images, loadedImages]);

  // Se houver apenas uma imagem, não mostrar controles
  const singleImage = images.length <= 1;

  useEffect(() => {
    if (!autoPlay || singleImage || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev: number) => (prev + 1) % images.length);
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
      setCurrentIndex((prev: number) => (prev + 1) % images.length);
    }
    if (isRightSwipe && !singleImage) {
      setCurrentIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
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
      {/* Container das imagens com transição suave */}
      <div className="relative w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full h-full flex-shrink-0">
              <img
                src={image}
                alt={`${alt} - Imagem ${index + 1} de ${images.length}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                onLoad={() => setLoadedImages((prev: Set<number>) => new Set(prev).add(index))}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
