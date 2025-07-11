"use client"

import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router";
import { FileQuestion } from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";

function NotFoundPage() {
    useEffect(() =>{
        document.title = 'Bali School Kids | 404 Not Found';
    }, []);
    const navigate = useNavigate();
    const handleNavigation = () => {
            navigate("/")
        }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar Section */}
            <Navbar onNavigate={handleNavigation}></Navbar>
            <div id="main" className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-md text-center">
                    <FileQuestion className="mx-auto h-16 w-16 text-muted-foreground" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        404 - Page Not Found
                    </h1>
                    <p className="mt-4 text-muted-foreground">
                        Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or you may have mistyped the address.
                    </p>
                    <div className="mt-6">
                        <Button asChild>
                            <Link to="/">Go Back Home</Link>
                        </Button>
                    </div>
                </div>
            </div>
            {/* Footer Section */}
            <Footer />
        </div>
    );
}

export default NotFoundPage;
