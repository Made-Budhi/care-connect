import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

function AboutPage(){
     const [activeTab, setActiveTab] = useState("THE BENEFIT");

     useEffect(() =>{
        document.title = 'Bali School Kids | About Us';
    }, []);

    const navigate = useNavigate();
    const handleNavigation = () => {
            navigate("/")
        }

    const renderTabContent = () => {
        switch(activeTab) {
            case "THE BENEFIT":
                return (
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="md:w-1/3 flex flex-col items-center">
                                <img 
                                    src="/pictures/together.jpg" 
                                    alt="Making a Difference Together" 
                                    className="w-48 h-48 object-contain mb-4"
                                />
                            </div>
                            <div className="w-full md:w-2/3 text-gray-700 leading-relaxed">
                                <p className="mb-4">
                                    The Rotary Club of Boulder and Swan Rotary Clubs work together with the Rotary Club of Bali-Denpasar to foster 
                                    genuine international goodwill in a very personal way. This is achieved by helping village children access primary 
                                    school education. Benefits include: school needs, classroom equipment, environmental education, health checks 
                                    and teacher development.
                                </p>
                                <p>
                                    The Bali-Sembung project began in 1999 supporting just three children. Since then, nearly two thousand children 
                                    have been assisted to attend primary school and are enjoying a brighter future. With assistance from a local 
                                    Rotarian or Rotaractor supporters are encouraged to meet the children at their school and this is certain to be a 
                                    highlight of any trip to Bali.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "WHAT YOUR PROVIDE":
                return (
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">What Your Contributions Provide</h3>
                            <p className="mb-4">Your generous donations help provide:</p>
                            <ul className="list-disc list-inside space-y-2 mb-4">
                                <li>School uniforms and supplies</li>
                                <li>Educational materials and books</li>
                                <li>Health check-ups and medical care</li>
                                <li>Teacher training and development</li>
                                <li>Classroom improvements and equipment</li>
                                <li>Environmental education programs</li>
                            </ul>
                            <p>Every contribution, no matter the size, makes a meaningful difference in a child's educational journey.</p>
                        </div>
                    </div>
                );
            case "BACKGROUND":
                return (
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">Project Background</h3>
                            <p className="mb-4">
                                The Bali School Kids project is a collaborative effort between international Rotary Clubs, 
                                demonstrating the power of global partnership in education.
                            </p>
                            <p className="mb-4">
                                Started in 1999 with just three children, this initiative has grown to support nearly 
                                two thousand children over the years, providing them with access to quality primary education.
                            </p>
                            <p>
                                The project focuses on sustainable development by not only supporting individual children 
                                but also improving the overall educational infrastructure in rural Balinese communities.
                            </p>
                        </div>
                    </div>
                );
            case "MORE INFO":
                return (
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">Additional Information</h3>
                            <p className="mb-4">
                                For more information about the Bali School Kids project, sponsorship opportunities, 
                                or to arrange a visit to see the project in action, please contact us.
                            </p>
                            <p className="mb-4">
                                We welcome visitors and supporters to witness firsthand the impact of their contributions 
                                on the lives of these remarkable children.
                            </p>
                            <p>
                                Join us in making a lasting difference in education and community development in Bali.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return(
         <div id="main" className="min-h-screen flex flex-col">
            <Navbar onNavigate={handleNavigation}/>
            
            {/* Hero Section */}
            <div className="relative h-96 bg-cover bg-center" style={{
                backgroundImage: `url('/pictures/hero-image.png')`,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                backgroundBlendMode: 'multiply'
            }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold text-white text-center">About us</h1>
                </div>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-800 text-white py-6">
                <div className="w-full mx-auto px-6 text-center">
                    <p className="text-sm md:text-base leading-relaxed">
                        An initiative of the Rotary Clubs of Swan Valley and Ellenbrook (Western Australia) jointly with the Rotary Club of Bali-Denpasar.
                        <br />
                        The project is registered and supervised through Rotary Australia World Community Service Ltd as part of Rotary Australia Overseas Aid Fund (ABN 21 388 376 554)
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <section className="bg-white py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-2 mb-8 md:flex-nowrap md:space-x-8 md:gap-0">
                        {["THE BENEFIT", "WHAT YOUR PROVIDE", "BACKGROUND", "MORE INFO"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-3 py-2 text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                                    activeTab === tab
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 hover:text-blue-600"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="bg-white">
                        {renderTabContent()}
                    </div>
                </div>
            </section>

            {/* Important Notice */}
            <div className="bg-blue-800 text-white py-6">
                <div className="w-full mx-auto px-6 text-center">
                    <h3 className="font-semibold mb-2">IMPORTANT NOTICE – PRIVACY ACT</h3>
                    <p className="text-sm leading-relaxed">
                        In accordance with the Privacy Act (1988), any personal details collected by Bali School Kids are held in strict confidence and will not be disclosed to any third parties or used for marketing purposes.
                    </p>
                </div>
            </div>

            <Footer/>
         </div>
    )
}

export default AboutPage