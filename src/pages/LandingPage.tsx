import { useState } from "react";
import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router";
import {Link as ScrollLink} from "react-scroll";
import Logo from "@/components/care-connect-logo.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import useLogout from "@/hooks/useLogout.tsx";

function LandingPage() {
    const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    }

    const handleDashboard = () => {
        switch (auth.role) {
            case 'sponsor':
                navigate('/sponsor/children');
                break;
            case 'stuart':
                navigate('/stuart/children');
                break;
            case 'school':
                navigate('/school/children');
                break;
            case 'admin':
                navigate('/admin/children');
                break;
            default:
                // If the role is not recognized, redirect to unauthorized page
                navigate('/unauthorized');
        }
    }

    return (
    <>
        
        {/* <div className="p-4 flex flex-col gap-4 items-start">
            
            <h1 className="text-2xl font-bold">Care Connect</h1>
            <div className="flex gap-2">

                {auth.accessToken ? (
                    <>
                        <Button onClick={handleLogout}>Log Out</Button>
                        <Button onClick={handleDashboard}>Dashboard</Button>
                    </>
                ) : (
                    <Link to={"/login"} className={buttonVariants({variant: "default"})}>Login</Link>
                )}
            </div>
            
            <div>
                {auth.accessToken ? <p>You are logged in.</p> : <p>You are not logged in.</p>}
            </div>
        </div> */}
    <div className="min-h-screen flex flex-col">  
        <header className="sticky top-0 z-50 bg-blue-800 text-white flex flex-wrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2">
                <Logo />
            </div>
            <nav className="hidden sm:flex gap-4 md:gap-6 justify-center">
                <ScrollLink
                    to="main"
                    smooth={true}
                    duration={500}
                    className="hover:underline cursor-pointer"
                >
                    Home
                </ScrollLink>
                <ScrollLink
                    to="about"
                    smooth={true}
                    duration={500}
                    className="hover:underline cursor-pointer"
                >
                    About
                </ScrollLink>
                <ScrollLink
                    to="program"
                    smooth={true}
                    duration={500}
                    className="hover:underline cursor-pointer"
                >
                    Program
                </ScrollLink>

                {/*TODO: To be added:*/}
                {/*<Link to="/contact" className="hover:underline">Contact</Link>*/}
            </nav>
            <div className="hidden sm:flex items-center gap-4">
                {auth.session ? (
                    <>
                        <Button onClick={handleLogout} className={buttonVariants({ variant: "secondary" })}>Log Out</Button>
                        <Button onClick={handleDashboard} className={buttonVariants({ variant: "secondary" })}>Dashboard</Button>
                    </>
                ) : (
                    <>
                        <Link to={"/register"} className={buttonVariants({ variant: "secondary" })}>Sign Up</Link>
                        <Link to={"/login"} className={buttonVariants({ variant: "secondary" })}>Login</Link>
                    </>
                )}
            </div>
            {/* Mobile menu toggle button */}
            <button
                className="sm:hidden text-white"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                ☰
            </button>
            {/* Mobile navigation dropdown */}
            {isMobileMenuOpen && (
                <nav className="absolute top-full left-0 w-full bg-black/50 text-white flex flex-col gap-2 p-4 rounded z-50">
                    <ScrollLink
                        to="main"
                        smooth={true}
                        duration={500}
                        className="hover:underline cursor-pointer"
                    >
                        Home
                    </ScrollLink>
                    <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                    <ScrollLink
                        to="about"
                        smooth={true}
                        duration={500}
                        className="hover:underline cursor-pointer"
                    >
                        About
                    </ScrollLink>
                    <ScrollLink
                        to="program"
                        smooth={true}
                        duration={500}
                        className="hover:underline cursor-pointer"
                    >
                        Program
                    </ScrollLink>
                    <Link to="/contact" className="hover:underline">Contact</Link>
                    <div className="flex flex-col gap-2 mt-4">
                        {auth.session ? (
                            <>
                                <Button onClick={handleDashboard} className={buttonVariants({ variant: "secondary" })}>Dashboard</Button>
                                <div className="relative text-center text-sm after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:z-0 after:border-t after:border-border">
                                    <span className="relative z-10 bg-accent-foreground/75 px-1 rounded-2xl text-white">
                                        Or
                                    </span>
                                </div>
                                <Button onClick={handleLogout} className={buttonVariants({ variant: "secondary" })}>Log Out</Button>
                            </>
                        ) : (
                            <>
                                <Link to={"/register"} className={buttonVariants({ variant: "secondary" })}>Sign Up</Link>
                                <div className="relative text-center text-sm after:absolute after:inset-x-0 after:top-1/2 after:-translate-y-1/2 after:z-0 after:border-t after:border-border">
                                    <span className="relative z-10 bg-accent-foreground/75 px-1 rounded-2xl text-white">
                                        Or
                                    </span>
                                </div>
                                <Link to={"/login"} className={buttonVariants({ variant: "secondary" })}>Login</Link>
                            </>
                        )}
                    </div>
                </nav>
            )}
        </header>
        <main className="flex-grow" onClick={() => setIsMobileMenuOpen(false)}>
            {/* Hero Section */}
            <section id="main" className="bg-cover bg-center text-white py-60 px-6" style={{ backgroundImage: "url('/pictures/hero-image.png')" }}>
                <div className="max-w-4xl text-left pl-6">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">Give Hope, Save Children's Future</h1>
                    <p className="text-lg sm:text-xl mb-8">
                        Every child deserves the chance to shine—and every sponsor deserves to witness that journey. With our platform, you can stay connected, track progress, and celebrate every milestone in your sponsored child's life.
                    </p>
                </div>
            </section>

            {/* What We Do Section */}
            <section id="about" className="py-16 px-6 bg-gray-100">
                <div className="max-w-6xl mx-auto">
                    {/* Content Row */}
                    <div className="flex flex-col sm:flex-row items-center gap-8 mb-12">
                        {/* Image */}
                        <div className="flex-shrink-0">
                            <img 
                                src="/pictures/children.png" 
                                alt="What we do" 
                                className="rounded-lg shadow-lg w-full sm:w-96"
                            />
                        </div>
                        {/* Text Content */}
                        <div className="flex-grow text-left">
                            <h2 className="text-3xl font-bold mb-4">What we do</h2>
                            <p className="text-lg">
                                We are dedicated to creating equal opportunities in education by connecting children from underprivileged backgrounds with sponsors who care. Through academic sponsorships, we help cover essential needs such as school tuition, uniforms, learning materials, and other educational expenses. Our goal is to empower children to stay in school, pursue their dreams, and build a better future for themselves and their communities.
                            </p>
                        </div>
                    </div>
                    {/* Features Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex flex-col items-center text-center">
                            <img src="/pictures/open-book.png" alt="Education" className="h-12 mb-4" />
                            <h3 className="font-bold text-lg">Education</h3>
                            <p className="text-sm">Support growth through learning.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <img src="/pictures/connection.png" alt="Connection" className="h-12 mb-4" />
                            <h3 className="font-bold text-lg">Connection</h3>
                            <p className="text-sm">Meaningful sponsor-child relationships.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <img src="/pictures/eye.png" alt="Transparency" className="h-12 mb-4" />
                            <h3 className="font-bold text-lg">Transparency</h3>
                            <p className="text-sm">Clear, real-time child updates.</p>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <img src="/pictures/socialsupport.png" alt="Local Communities" className="h-12 mb-4" />
                            <h3 className="font-bold text-lg">Local Communities</h3>
                            <p className="text-sm">Support from local communities.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Program Section */}
            <section id="program" className="py-16 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6">Our Program</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white shadow rounded p-4">
                            <img src="/pictures/children.png" alt="Program 1" className="rounded mb-4" />
                            <h3 className="font-bold mb-2">After School Enrichment</h3>
                            <p className="text-sm mb-4">Creating safe and engaging spaces for learning beyond the classroom.</p>
                            <Button>View Details</Button>
                        </div>
                        <div className="bg-white shadow rounded p-4">
                            <img src="/pictures/children.png" alt="Program 2" className="rounded mb-4" />
                            <h3 className="font-bold mb-2">Future Scholars Fund</h3>
                            <p className="text-sm mb-4">Supporting high-achieving students to pursue higher education.</p>
                            <Button>View Details</Button>
                        </div>
                        <div className="bg-white shadow rounded p-4">
                            <img src="/pictures/children.png" alt="Program 3" className="rounded mb-4" />
                            <h3 className="font-bold mb-2">School Starter Pack</h3>
                            <p className="text-sm mb-4">Providing essential supplies to help children begin their academic journey.</p>
                            <Button>View Details</Button>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        {/* Footer */}
        <footer className="bg-blue-800 text-white py-6 text-center">
            <p>Copyright © 2025, all rights reserved by CareConnect</p>
        </footer>
    </div>    
    </>
    );
}
export default LandingPage
