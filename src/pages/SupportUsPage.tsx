import { useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";

function SupportUsPage(){
     useEffect(() =>{
        document.title = 'Bali School Kids | Support Us';
    }, []);

    const navigate = useNavigate();
    const handleNavigation = () => {
            navigate("/")
        }

    const handleBecomeSupporterClick = () => {
        // Redirect to donation page
        window.open('https://donations.rawcs.com.au/Default.aspx?ProjectID=437&ReturnTo=3', '_blank');
    };

    const handleRenewSupportClick = () => {
        // Redirect to renewal page
        window.open('https://donations.rawcs.com.au/Default.aspx?ProjectID=437&ReturnTo=3', '_blank');
    };

    return(
         <div id="main" className="min-h-screen flex flex-col">
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
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">Support us</h1>
                </div>
            </section>

            {/* Support Content */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <p className="text-lg mb-6 text-gray-700">
                        Thank you for deciding to make a difference!
                    </p>
                    
                    <p className="text-base mb-6 text-gray-600">
                        To donate or renew your support of A$130 per annum, select one of the secure buttons below.
                    </p>
                    
                    <p className="text-base mb-6 text-gray-600">
                        You will be redirected to the Rotary Australia World Community Service (RAWCS) page to make payment via either credit card, internet transfer or cheque.
                    </p>
                    
                    <p className="text-base mb-12 text-gray-600">
                        A receipt will be emailed to you shortly after.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                        <Button 
                            onClick={handleBecomeSupporterClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-8 text-lg font-medium min-w-[200px]"
                        >
                            BECOME A SUPPORTER
                        </Button>
                        
                        <Button 
                            onClick={handleRenewSupportClick}
                            variant="outline"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 px-12 py-8 text-lg font-medium min-w-[200px]"
                        >
                            RENEW YOUR SUPPORT
                        </Button>
                    </div>

                    {/* Rotary Logos */}
                        <div className="flex justify-center items-center mt-15">
                            <img src="/pictures/Boulder-Swan-BSK.png" alt="Rotary Boulder" className="h-16 sm:h-20 md:h-26" />
                        </div>
                </div>
            </section>

            {/* Privacy Notice */}
            <section className="bg-blue-800 text-white py-6 mt-auto">
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

export default SupportUsPage