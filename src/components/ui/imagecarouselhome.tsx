import { useState, useEffect, useRef, useCallback } from "react";

function HeroCarousel() {
    const heroImages = [
        { src: "/pictures/homeslider-web1.jpg", alt: "Hero Image 1" },
        { src: "/pictures/homeslider-web2.jpg", alt: "Hero Image 2" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Function to reset and restart autoplay
    const resetAutoplay = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 6000); // Change image every 6 seconds
    }, [heroImages.length]);

    // Handle navigation click with reset
    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        resetAutoplay(); // Reset timer when manually changing slides
    };

    // Initialize autoplay on component mount
    useEffect(() => {
        resetAutoplay();
        
        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [resetAutoplay]);

    return (
        <>
            {heroImages.map((image, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000" ${
                        index === currentIndex ? "opacity-100" : "opacity-0"
                     }`}
                    style={{
                         backgroundImage: `url(${image.src})`,
                         backgroundColor: 'rgba(0, 0, 0, 0.4)',
                         backgroundBlendMode: 'multiply',
                         backgroundSize: 'cover',
                         backgroundPosition: 'center center',
                    }}
                />
            ))}

            <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 gap-2">
                {heroImages.map((_, index) => (
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
        </>
    );
}

export default HeroCarousel;