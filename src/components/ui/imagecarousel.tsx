import { useState, useEffect, useRef } from "react";

interface ImageCarouselProps {
  images: {
    src: string;
    alt: string;
  }[];
  autoPlayInterval?: number;
}

const ImageCarousel = ({ images, autoPlayInterval = 5000 }: ImageCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = (prevIndex + 1) % images.length;
            scrollToIndex(newIndex);
            return newIndex;
        });
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = (prevIndex - 1 + images.length) % images.length;
            scrollToIndex(newIndex);
            return newIndex;
        });
    };

    const goToSlide = (index: number) => {
        scrollToIndex(index);
        setCurrentIndex(index);
    };

    const scrollToIndex = (index: number) => {
        if (carouselRef.current && window.innerWidth < 768) { // Only for mobile
            const scrollAmount = index * (window.innerWidth * 0.85);
            carouselRef.current.scrollTo({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Handle touch events for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 75) {
            // Swipe left
            goToNext();
        } else if (touchStart - touchEnd < -75) {
            // Swipe right
            goToPrevious();
        }
    };

    // Auto play
    useEffect(() => {
        const interval = setInterval(goToNext, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlayInterval]);

    return (
        <div className="relative pb-10">
            {/* Desktop Carousel - Show all images at once */}
            <div className="hidden md:grid grid-cols-4 gap-8">
                {images.map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg shadow-lg">
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="h-128 w-128 object-cover transition-transform hover:scale-105 duration-300"
                        />
                    </div>
                ))}
            </div>

            {/* Mobile Carousel - Scrollable with swipe */}
            <div 
                ref={carouselRef}
                className="md:hidden flex overflow-x-scroll snap-mandatory snap-x scrollbar-hide"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                    scrollBehavior: 'smooth',
                }}
            >
                {images.map((image, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 w-[85vw] px-2 snap-center"
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-64 object-cover rounded-lg shadow-lg"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation dots (visible on mobile only) */}
            <div className="md:hidden absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
}

export default ImageCarousel;