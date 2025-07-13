import { useState, useEffect, useRef, useCallback } from "react";

interface Testimonial {
    quote: string;
    author: string;
    location: string; 
}

interface TestimonialCarouselProps {
    testimonials: Testimonial[];
    autoPlayInterval?: number;
}

const TestimonialCarousel = ({ testimonials, autoPlayInterval = 5000 }: TestimonialCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to clear and restart autoplay timer
    const resetAutoplay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(() => {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
            setTimeout(() => setIsTransitioning(false), 700);
        }, autoPlayInterval);
    }, [autoPlayInterval, testimonials.length]);

    const goToNext = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
            setTimeout(() => setIsTransitioning(false), 700);
            // Reset autoplay timer
            resetAutoplay();
        }
    };

    const goToPrevious = () => {
        if (!isTransitioning) {
            setIsTransitioning(true);
            setCurrentIndex((prevIndex) =>
                prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
            );
            setTimeout(() => setIsTransitioning(false), 700);
            // Reset autoplay timer
            resetAutoplay();
        }
    };

    const goToSlide = (index: number) => {
        if (!isTransitioning && index !== currentIndex) {
            setIsTransitioning(true);
            setCurrentIndex(index);
            setTimeout(() => setIsTransitioning(false), 700);
            // Reset autoplay timer
            resetAutoplay();
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

    // Initialize autoplay
    useEffect(() => {
        resetAutoplay();
        
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [resetAutoplay]);

    // ...existing code untuk return statement tetap sama...
    return (
        <div className="relative w-full max-w-4xl mx-auto">
            {/* Desktop View - Single Card dengan Scroll Effect */}
            <div className="hidden md:block overflow-hidden">
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="w-full flex-shrink-0 px-8"
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto text-center border border-blue-100">
                                <div className="text-6xl text-blue-800 mb-6">❝</div>
                                <p className="mb-8 text-lg text-gray-700 leading-relaxed min-h-[120px] flex items-center justify-center">
                                    {testimonial.quote}
                                </p>
                                <div className="mt-auto">
                                    <p className="text-base text-gray-600 font-medium">
                                        {testimonial.author}, {testimonial.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile View - Fixed dengan padding yang benar */}
            <div 
                ref={carouselRef}
                className="md:hidden relative overflow-hidden px-4"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="w-full flex-shrink-0 px-2"
                        >
                            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-lg border border-blue-100">
                                <div className="text-4xl text-blue-800 mb-4">❝</div>
                                <p className="mb-6 min-h-[120px] text-gray-700 leading-relaxed text-sm">
                                    {testimonial.quote}
                                </p>
                                <div className="mt-auto">
                                    <p className="text-sm text-gray-600 font-medium">
                                        {testimonial.author}, {testimonial.location}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>   
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        disabled={isTransitioning}
                        className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50 ${
                            index === currentIndex 
                                ? 'bg-blue-800 scale-110' 
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        aria-label={`Go to testimonial ${index + 1}`}
                    />
                ))}
            </div>

            {/* Navigation Arrows - Desktop Only */}
            <button
                onClick={goToPrevious}
                disabled={isTransitioning}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white text-blue-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed hidden md:block z-10"
                aria-label="Previous testimonial"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </button>
            
            <button
                onClick={goToNext}
                disabled={isTransitioning}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white text-blue-800 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed hidden md:block z-10"
                aria-label="Next testimonial"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
            </button>
        </div>    
    );
};

export default TestimonialCarousel;