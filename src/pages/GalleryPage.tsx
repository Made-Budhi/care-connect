import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import SociableInstagram from "@/components/ui/socialble";

function Gallery(){
    const [key, setKey] = useState(0);

    useEffect(() =>{
        document.title = 'Bali School Kids | Gallery';
        setKey(prev => prev + 1)
    }, []);

    const navigate = useNavigate();
    const handleNavigation = () => {
            navigate("/")
        }

    return(
        <div id="main" className="min-h-screen flex flex-col">
            <Navbar onNavigate={handleNavigation}/>
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Gallery</h1>
                
                {/* Instagram Feed Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-center">Follow Our Instagram</h2>
                    {/* Change "embedId" with ID that you get on SociableKit */}
                    <SociableInstagram key={key} embedId="25576419" />
                </div>
            </main>
            <Footer/>
        </div>
    )
}

export default Gallery