import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

function CulturePage(){
    const [activeTab, setActiveTab] = useState("BIRTHDAY");

    useEffect(() =>{
        document.title = 'Bali School Kids | Culture';
    }, []);

    const navigate = useNavigate();
    const handleNavigation = () => {
            navigate("/")
        }

    const renderTabContent = () => {
        switch(activeTab) {
            case "BIRTHDAY":
                return (
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="w-full md:w-1/3 flex flex-col items-center">
                                <img 
                                    src="/pictures/birthday.jpg" 
                                    alt="Birthday Card" 
                                    className="w-48 h-48 object-contain mb-4"
                                />
                            </div>
                            <div className="w-full md:w-2/3 text-gray-700 leading-relaxed">
                                <p className="mb-4">
                                    Although we provide the children's birthdates, other than determining when the children start school, birthdays 
                                    are not particularly important to the children themselves. Balinese children do not celebrate their birthday every 
                                    twelve months as most westerners do.
                                </p>
                                <p>
                                    Of more cultural importance is the relationship between date of birth and important religious celebrations. For 
                                    example, when following the 210 day religious calendar, a birthday several days after Galungan will always be 
                                    celebrated several days after Galungan (irrespective of the date) and there may be two celebrations in a single 
                                    calendar year.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case "HINDU BALI NAMING":
                return (
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">Hindu Bali Naming Convention</h3>
                            <p className="mb-4">
                                In Balinese Hindu culture, naming conventions follow traditional patterns that reflect the caste system 
                                and birth order. The naming system is deeply rooted in religious and cultural significance.
                            </p>
                            <p className="mb-4">
                                Common first names include Wayan, Made, Nyoman, and Ketut, which indicate the birth order of children 
                                in the family. These names are used regardless of gender and cycle through for subsequent children.
                            </p>
                            <p>
                                Understanding these naming conventions helps us better connect with and respect the cultural identity 
                                of the children we support in our program.
                            </p>
                        </div>
                    </div>
                );
            case "FOOD PARCELS":
                return (
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">Food Parcels Program</h3>
                            <p className="mb-4">
                                Our food parcel program provides essential nutrition support to families in need. These parcels contain 
                                staple foods that are culturally appropriate and meet the dietary needs of Balinese families.
                            </p>
                            <p className="mb-4">
                                Each parcel typically includes rice, cooking oil, sugar, salt, and other basic necessities that help 
                                ensure children have proper nutrition to support their education and development.
                            </p>
                            <p>
                                The distribution of food parcels is coordinated with local community leaders to ensure they reach 
                                the families who need them most, particularly during challenging times.
                            </p>
                        </div>
                    </div>
                );
            case "SCHOOL REPORT TRANSLATION":
                return (
                    <div className="max-w-6xl mx-auto px-6 py-8">
                        <div className="text-gray-700 leading-relaxed">
                            <h3 className="text-xl font-semibold mb-4">School Report Translation</h3>
                            <p className="mb-4">
                                We provide translation services for school reports to help sponsors better understand their sponsored 
                                child's academic progress. All reports are translated from Bahasa Indonesia to English.
                            </p>
                            <p className="mb-4">
                                This service includes translation of grades, teacher comments, and any special notes about the child's 
                                performance, behavior, and areas where additional support might be needed.
                            </p>
                            <p>
                                Regular translation of school reports helps maintain strong communication between sponsors and the 
                                children they support, creating meaningful connections across cultural and language barriers.
                            </p>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return(
        <div className="min-h-screen flex flex-col">
            <Navbar onNavigate={handleNavigation}/>
            
            {/* Hero Section */}
            <section 
                id="main"
                className="relative h-96 bg-cover bg-center flex items-center justify-center"
                style={{
                    backgroundImage: "url('/pictures/hero-image.png')",
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundBlendMode: 'multiply'
                }}
            >
                <div className="text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">Culture</h1>
                </div>
            </section>

            {/* Tab Navigation */}
            <section className="bg-white py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-wrap justify-center gap-2 mb-8 md:flex-nowrap md:space-x-8 md:gap-0">
                        {["BIRTHDAY", "HINDU BALI NAMING", "FOOD PARCELS", "SCHOOL REPORT TRANSLATION"].map((tab) => (
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

            {/* Privacy Notice */}
            <section className="bg-blue-700 text-white py-6 mt-auto">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h3 className="font-semibold mb-2">IMPORTANT NOTICE – PRIVACY ACT</h3>
                    <p className="text-sm">
                        In accordance with the Privacy Act (1988), any personal details collected by Bali School Kids are held in strict confidence and will not be disclosed to any third parties or used for marketing purposes.
                    </p>
                </div>
            </section>

            <Footer/>
        </div>
    )
}

export default CulturePage