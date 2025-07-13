import { useEffect } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import {
  MapPin,
  User,
  School,
  Mail,
  Gift,
  Receipt,
  CreditCard,
} from 'lucide-react';

function FaqPage(){
    const navigate = useNavigate();
    const handleNavigation = () => {
        navigate("/")
    }

    useEffect(() =>{
        document.title = 'Bali School Kids | FAQ';
    }, []);

    const faqCards = [
        {
            id: 1,
            icon: MapPin,
            title: "Can We Visit Our Supported Child?",
            description: (
                <>
                    You certainly can! With assistance from a local Rotarian or Rotaractor, we encourage supporters to meet the children at their school when visiting Bali. 
                    Each child is aware and very grateful to their supporters. Visiting is a fantastic way for the children to get to know you and build a friendship. 
                    For further details on organizing a visit please click{' '}
                    <a href="/contact" target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline">
                    Here
                    </a>
                </>
            ) 
        },
        {
            id: 2,
            icon: User,
            title: "Who Is Responsible for the Project?",
            description: (
                <>
                    Bali School Kids an International Project of the Rotary Clubs of Boulder and Midland (Western Australia) jointly with the Rotary Club Bali-Denpasar (Indonesia)<br />
                    <br />
                    The project is registered with Rotary Australia World Community Service Ltd (Project No: 54-2010-11) as part of the Rotary Australia Overseas Aid Fund (ABN 21 388 376 554).<br />
                    <br />
                    Donations are fully tax-deductible in Australia.
                </>
            )
        },
        {
            id: 3,
            icon: School,
            title: "How Do I get to the School?",
            description: (
                <>
                    This is often an adventure in itself! Most drivers and taxis will know the whereabouts of the schools. Save the mobile number of Agung and Ayu and give this to your driver if you have trouble finding the school (see the Contact Us page for details).<br/>
                    <br/>
                    Please email either{' '} <a href="mailto:info@balischoolkids.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">info@balischoolkids.org</a> {' '} or <a href="mailto:agung@balischoolkids.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">agung@balischoolkids.org</a>{' '}  
                    if you wish to visit so we can make arrangements with the school. Wherever possible it is preferable that school visits are undertaken on Saturdays so as not to interrupt the children’s mainstream education days of Monday-Friday. 
                    The Saturday school program is more flexible and often includes sport or cultural activities which you can join in with.<br/>
                    <br/>
                    A Rotarian will accompany your visit to assist with translation so you can talk with your supported child and ask questions of the teachers etc.
    
                </>
            )
        },
        {
            id: 4,
            icon: Mail,
            title: "Can I Correspond with My Supported Child?",
            description: (
                <>
                    You certainly can! We encourage supporters to write letters which can be forwarded to our {' '} <a href="/contact" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">postal address.</a> {' '} 
                    We will then collect all letters together and they will be sent in a batch to Bali for distribution.
                    As letters are taken to Bali in hand luggage, we cannot accept presents with the letters.{' '} <br/>
                    <br/>
                    Alternatively, you can email your letters which will be taken to the child’s school via Agung or Ayu on their next visit
                </>
            ) 
        },
        {
            id: 5,
            icon: Gift,
            title: "Can I Buy Presents for My Child?",
            description: (
                <>
                    You sure can! However, please be mindful of what you buy as it may set a precedent for future gifts the child or others may expect with each visit.<br/>
                    <br/>
                    <strong>The biggest NO-NO:</strong>
                    <ul className="list-disc list-inside mt-2 mb-4 text-left">
                        <li>Lollies or sweets as these damage the children's teeth</li>
                    </ul>
                    
                    <strong>Great gift ideas:</strong>
                    <ul className="list-disc list-inside mt-2 mb-4 text-left">
                        <li>Colouring books and pencils</li>
                        <li>Texters and picture books</li>
                        <li>Craft supplies</li>
                        <li>Tennis ball</li>
                        <li>Clothes (new or good quality second hand)</li>
                    </ul>
                    
                    Also consider a little something for the teachers or the school, as this benefits not only your supported child but their classmates and the overall school community.
                </>
            )
        },
        {
            id: 6,
            icon: Receipt,
            title: "Is My Support Tax Deductible?",
            description: (
                <>
                    Yes. As the project is registered with Rotary Australia World Community Service Ltd (Project No: 54-2010-11) as part of the Rotary Australia Overseas Aid Fund (ABN 21 388 376 554) all donations are fully tax deductible in Australia.<br/>
                    <br/>
                    <strong>Want to give a little extra? You can always consider these possibilities:</strong>
                     <ul className="list-disc list-inside mt-2 mb-4 text-left">
                        <li>A white board for a classroom</li>
                        <li>Whiteboard markers</li>
                        <li>A donation towards computers or supplies</li>
                        <li>Books about your country’s flora, fauna and landscape.</li>
                        <li>Sporting equipment such as tennis balls, basketballs, footballs, etc.</li>
                        <li>Or best of all, you could support another child!</li>
                    </ul>
                    Remember……a gift to the school not only helps the teachers, but also the present and future students.
                </>
            ) 
        },
        {
            id: 7,
            icon: CreditCard,
            title: "How Can I Make Payments?",
            description: (
                <>
                   Follow one of the secure payment links from the {' '} <a href="/support" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">support us</a> {' '} page. You will be redirected to the RAWCS (Rotary Australia World Community Service) page to make payment via either credit card, 
                   internet transfer or cheque and a receipt will be emailed to you shortly after.<br/>
                   <br/>
                   Your emailed receipt contains all the required details for your chosen payment method (ie: BSB and Account Number for internet transfer).<br/>
                   <br/>
                   You can use the requests section to update your details (ie change of address, email etc..) or specify whether you wish to support a new little boy or girl).
    
                </>
            )
        }
    ];

    return(
        <div id="main" className="min-h-screen flex flex-col">
            <Navbar onNavigate={handleNavigation}/>
            
            {/* Hero Section */}
            <section 
                className="relative h-96 bg-cover bg-center flex items-center justify-center"
                style={{
                    backgroundImage: "url('/pictures/hero-image.png')",
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    backgroundBlendMode: 'multiply'
                }}
            >
                <div className="text-center text-white">
                    <h1 className="text-5xl md:text-6xl font-bold mb-4">FAQ</h1>
                </div>
            </section>

            {/* FAQ Cards Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {faqCards.map((card) => {
                            const IconComponent = card.icon;
                            return (
                                <div 
                                    key={card.id} 
                                    className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300"
                                >
                                    <div className="flex justify-center mb-6">
                                        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                                            <IconComponent className="w-8 h-8 text-orange-500" />
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                                        {card.title}
                                    </h3>
                                    
                                    <div className="text-gray-600 text-sm leading-relaxed text-left">
                                        {card.description}
                                    </div>
                                </div>
                            );
                        })}
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

export default FaqPage