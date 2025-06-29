import { useState, useEffect } from "react";

function HeroCarousel() {
    const heroImages = [
        { src: "/pictures/homeslider-web1.jpg", alt: "Hero Image 1" },
        { src: "/pictures/homeslider-web2.jpg", alt: "Hero Image 2" }
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 6000); // Change image every 6 seconds

        return () => clearInterval(interval);
    }, []);

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
                        onClick={() => setCurrentIndex(index)}
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