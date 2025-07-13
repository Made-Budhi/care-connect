import {buttonVariants} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import ImageCarousel from "@/components/ui/imagecarousel";
import HeroCarousel from "@/components/ui/imagecarouselhome.tsx";
import CountUp from "@/components/ui/countupprops";
import UseIntersectionObserver from "@/components/ui/intersectionobserver";
import TestimonialCarousel from "@/components/ui/testimonial-carousel-effect";
import Footer from "@/components/ui/footer";


function LandingPage() {
    useEffect(() =>{
        document.title = 'Bali School Kids | Home';
    }, []);

    const navigate = useNavigate();
    const [statsRef, isStatsVisible] = UseIntersectionObserver<HTMLDivElement>();

    const handleNavigation = () => {
        navigate("/")
    }

    return (
    <>
    <div className="min-h-screen flex flex-col">  
        <Navbar onNavigate={handleNavigation}></Navbar>
        {/* Main */}
        <main className="flex-grow">
            {/* Hero Section */}
            <section
                id="main"
                className="relative bg-top text-white py-60 px-6"
            >
                <div
                    className="absolute inset-0 z-0">
                        <HeroCarousel />
                    </div>
                <div className="max-w-4xl text-left pl-6 sm:translate-y-0 -translate-y-20">
                    <h1 className="text-5xl sm:text-7xl font-bold mb-6">Bali School Kids</h1>
                    <p className="text-lg sm:text-2xl mb-8">
                        An initiative of the Rotary Clubs of Boulder and Swan jointly with the Rotary Club of Bali-Denpasar
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link to={"/support"} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg font-medium transition-colors flex items-center justify-center">Support Now ❤︎</Link>
                        <Link to={"/about"} className="bg-transparent hover:bg-white/20 border border-white text-white px-8 py-3 rounded-md text-lg font-medium transition-colors flex items-center justify-center">Learn more {">"}</Link>
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section id="about" className="relative py-16 bg-gray-100">
                <div className=" mx-auto">
                    {/* Content Row */}
                    <div className="flex flex-col items-center gap-8 mb-12">
                        {/* Text Content */}
                        <div className="flex-1 max-w-4xl">
                            <h2 className="text-4xl text-center font-bold mb-4">Vision & Mission</h2>
                            <p className="text-lg m-3 text-justify">
                                To foster genuine international goodwill and understanding in a very personal way by helping village children in Bali access primary school education. Includes: school needs, classroom equipment, environmental education, health checks and teacher development
                            </p>
                        </div>
                    </div>
                    {/* Image Carousel */}
                    <div className="mt-4">
                        <ImageCarousel
                            images={[
                                { src: "/pictures/home-image-4.jpg", alt: "Rotary volunteer with student" },
                                { src: "/pictures/home-image-3.jpg", alt: "Student with flag" },
                                { src: "/pictures/home-image-2.jpg", alt: "Balinese dancers" },
                                { src: "/pictures/home-image-1.jpg", alt: "Volunteer" }
                            ]}
                            autoPlayInterval={5000}
                        />
                    </div>

                {/* Stats */}
                    <div ref={statsRef} className="w-full py-8 mt-4 mb-12">
                        <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                            <div className="p-6">
                                <h3 className="text-5xl md:text:4xl font-bold mb-2">
                                    {isStatsVisible ? <CountUp end={1999} duration={1500} start={0}/> : 0}
                                </h3>
                                <p className="text-sm">Since</p>
                            </div>
                            {/* Dynamic Data maybe */}
                            <div className="p-6">
                                <h3 className="text-5xl md:text:4xl font-bold mb-2">
                                    {isStatsVisible ? <CountUp end={21} duration={1500} start={0}/> : 0}
                                </h3>
                                <p className="text-sm">School</p>
                            </div>
                            <div className="p-6">
                                <h3 className="text-5xl md:text:4xl font-bold mb-2">
                                    {isStatsVisible ? <CountUp end={455} duration={1500} start={0}/> : 0}
                                </h3>
                                <p className="text-sm">Current Supporters</p>
                            </div>
                            <div className="p-6">
                                <h3 className="text-5xl md:text:4xl font-bold mb-2">
                                    {isStatsVisible ? <CountUp end={2198} duration={1500} start={0}/> : 0}
                                </h3>
                                <p className="text-sm">Supported Children</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Row */}
                    <div className="px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 shadow-lg rounded-lg bg-white p-6">
                            <div className="flex flex-col items-center text-center">
                                <img src="/pictures/open-book.png" alt="Education" className="h-12 mb-4" />
                                <div className="mt-2 pt-2 flex flex-col">
                                    <h3 className="font-bold text-lg">Education</h3>
                                    <p className="text-sm">Support growth through learning.</p>  
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <img src="/pictures/connection.png" alt="Connection" className="h-12 mb-4" />
                                <div className="mt-2 pt-2 flex flex-col">     
                                    <h3 className="font-bold text-lg">Connection</h3>
                                    <p className="text-sm">Meaningful sponsor-child relationships.</p>
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <img src="/pictures/eye.png" alt="Transparency" className="h-10 mb-4" />
                                <div className="mt-4 pt-2 flex flex-col">
                                    <h3 className="font-bold text-lg">Transparency</h3>
                                    <p className="text-sm">Clear, real-time child updates.</p>                                   
                                </div>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <img src="/pictures/socialsupport.png" alt="Local Communities" className="h-12 mb-4" />
                                <div className="mt-2 pt-2 flex flex-col">
                                    <h3 className="font-bold text-lg">Local Communities</h3>
                                    <p className="text-sm">Support from local communities.</p>                                  
                                </div>
                            </div>
                        </div>

                        {/* Rotary Logos */}
                        <div className="flex justify-center items-center mt-15">
                            <img src="/pictures/Boulder-Swan-BSK.png" alt="Rotary Boulder" className="h-16 sm:h-20 md:h-26" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-8 bg-gray-100">
                    <div className="mx-auto px-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Event List</h3>
                                    <a href="https://www.balischoolkids.org/events/" className="text-sm text hover:underline">view details</a>
                                </div>
                                <div>
                                    <img src="/pictures/calendar-icon.png" alt="calendar " className="h-24 w-24" />
                                </div>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Frequent Question</h3>
                                    <a href="/faq" className="text-sm text hover:underline">view details</a>
                                </div>
                                <div>
                                    <img src="/pictures/question.png" alt="calendar " className="h-24 w-24" />
                                </div>
                            </div>
                            <div className="bg-white shadow-md rounded-lg p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold mb-2">Yayasan Foundation</h3>
                                    <a href="https://www.balischoolkids.org/yayasan-rotary-bali-denpasar/" className="text-sm text hover:underline">view details</a>
                                </div>
                                <div>
                                    <img src="/pictures/yayasan-1.png" alt="calendar " className="h-24 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
            </section>

            {/* Our Program Section */}
            <section id="program" className="py-16 px-6 bg-white">
                <div className="mx-6">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Our Program</h2>
                        <Link to="/programs" className="px-4 py-1 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition-colors">more</Link>
                    </div>

                    {/* First Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img1.png" alt="After School Enrichment" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">After School Enrichment</h3>
                                    <p className="text-gray-600 text-sm">
                                        Creating safe and engaging spaces for learning beyond the classroom. This program funds extracurricular activities, tutoring, and mentorship opportunities.
                                    </p>
                                </div>
                                <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img2.png" alt="Future Scholars Fund" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">Future Scholars Fund</h3>
                                    <p className="text-gray-600 text-sm">
                                        Supporting high-achieving students to pursue higher education. We offer scholarships for outstanding students with limited financial means.
                                    </p>
                                </div>
                                <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img3.png" alt="School Starter Pack" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">School Starter Pack</h3>
                                    <p className="text-gray-600 text-sm">
                                        Providing essential supplies to help children begin their academic journey with confidence. From backpacks to notebooks, this program equips students for success.
                                    </p>
                                </div>
                               <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img1.png" alt="After School Enrichment" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">After School Enrichment</h3>
                                    <p className="text-gray-600 text-sm">
                                        Creating safe and engaging spaces for learning beyond the classroom. This program funds extracurricular activities, tutoring, and mentorship opportunities.
                                    </p>
                                </div>
                                <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img2.png" alt="Future Scholars Fund" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">Future Scholars Fund</h3>
                                    <p className="text-gray-600 text-sm">
                                        Supporting high-achieving students to pursue higher education. We offer scholarships for outstanding students with limited financial means.
                                    </p>
                                </div>
                                <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg overflow-hidden shadow flex flex-col h-full">
                            <div className="h-48 overflow-hidden">
                                <img src="/pictures/Img3.png" alt="School Starter Pack" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-5 flex flex-col flex-grow">
                                <div className="flex-grow">
                                    <h3 className="font-bold text-xl mb-2">School Starter Pack</h3>
                                    <p className="text-gray-600 text-sm">
                                        Providing essential supplies to help children begin their academic journey with confidence. From backpacks to notebooks, this program equips students for success.
                                    </p>
                                </div>
                                <div className="mt-6 pt-2 flex flex-col">
                                    <Link to={"#"} className={buttonVariants({ variant: "default" })}>View Details</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimoni Section */}
            <section className="py-16 px-6 bg-white border-t border-gray-200">
                <div className="w-full">
                    <h2 className="text-3xl font-bold text-center mb-12">Voices That Care</h2>
                    <TestimonialCarousel
                        testimonials={[
                            {
                                quote: "My wife and I have now visited Wayan three times in two years. It was just great this last time as he recognised and ran up to us. We managed this time to meet his mother and younger brother which was a thrill to do. We are so glad to be a part of this program and give back to the Bali people this way.",
                                author: "Andy",
                                location: "-"
                            },
                            {
                                quote: "What a wonderful morning had yesterday at SD1 Mekarsari. We were so lucky to attend graduation day. It was lovely to see all the happy children and catch up with our Andi",
                                author: "Katie",
                                location: "-"
                            },
                            {
                                quote: "After five years of supporting Ayu's education I was just so thrilled to finally meet her. She is simply gorgeous!",
                                author: "Tracey",
                                location: "-"
                            }
                        ]}
                        />
                </div>
            </section>
        </main>

        {/* Footer Section */}
        <Footer />
    </div>    
    </>
    );
}
export default LandingPage
