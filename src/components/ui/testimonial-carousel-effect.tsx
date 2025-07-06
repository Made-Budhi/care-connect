import { useState, useEffect, useRef } from "react";

interface Testimonial{
    quote: string;
    author: string;
    location: String
}

interface TestimonialCarouselProps{
    testimonials: Testimonial[];
    autoPlayInterval?: number;
}

const TestimonialCarousel = ({ testimonials, autoPlayInterval = 5000 }: TestimonialCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const carouselRef = useRef<HTMLDivElement>(null);

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
        prevIndex == 0 ? testimonials.length - 1 : prevIndex - 1);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    //Handle touch event for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd >75) {
            //Swipe left
            goToNext();
        } else if (touchStart - touchEnd < -75) {
            //Swipe Right
            goToPrevious();
        }
    };

    //Autoplay
    useEffect(() => {
        const interval = setInterval(goToNext, autoPlayInterval);
        return() => clearInterval(interval);
    }, [autoPlayInterval]);

    return(
        <div className="relative">
            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="flex space-x-6 items-center">
                    {[0, 1, 2].map((offset) => {
                        const index = (currentIndex + offset) % testimonials.length;
                        return(
                            <div
                                key={index}
                                className="bg-gray-100 p-6 rounded-lg flex-1 min-w-[250px] transition-all duration-500">
                                    <div className="text-4xl text-blue-800 mb-4">
                                        ❝
                                    </div>
                                    <p className="mb-8 min-h-[100px]">{testimonials[index].quote}</p>
                                    <div className="mt-auto">
                                        <p className="text-sm text-gray-500">
                                            {testimonials[index].author}, {testimonials[index].location}
                                        </p>
                                    </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobel Piuw */}
            <div 
                ref={carouselRef}
                className="md:hidden relative overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-gray-100 p-6 rounded-lg- w-full flex-shrink-0"
                        >
                            
                            <div className="text-4xl text-blue-800 mb-4">❝</div>
                            <p className="mb-8 min-h-[100px]">{testimonial.quote}</p>
                            <div className="mt-auto">
                                <p className="text-sm text-gray-500">
                                    {testimonial.author}, {testimonial.location}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>   
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-6 space-x-2">
                {testimonials.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentIndex ? 'bg-blue-800' : 'bg-gray-300'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-4 bg-white text-blue-800 rounded-full p-2 shadow-md hidden md:block"
                aria-label="Previous testimonial"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </button>
            <button
                onClick={goToNext}
                className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-4 bg-white text-blue-800 rounded-full p-2 shadow-md hidden md:block"
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