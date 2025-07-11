import { useState } from "react";
import { Link, useNavigate } from "react-router";
//import { Link as ScrollLink } from "react-scroll";
import { Button, buttonVariants } from "@/components/ui/button.tsx";
import Logo from "@/components/care-connect-logo.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import useLogout from "@/hooks/useLogout.tsx";

interface NavbarProps {
  onNavigate?: () => void;
}

const Navbar = ({ onNavigate }: NavbarProps) => {
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    if (onNavigate) onNavigate();
  };

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
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Topbar section */}
      <section>
        <div className="bg-blue-900 hidden sm:flex text-white text-sm py-2 px-4">
          <div className="w-full flex items-center justify-between">
            {/* Left side - Email */}
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <polyline points="22,6 12,13 2,6" />
                                            </svg>
              <span>info@balischoolkids.org</span>
            </div>

            {/* Right side - Phone Numbers and Follow Us */}
            <div className="flex items-center gap-6">
              {/* Phone Numbers */}
              <div className="flex items-center gap-2">
                <svg className="bi bi-telephone-inbound" fill="currentColor" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M15.854.146a.5.5 0 0 1 0 .708L11.707 5H14.5a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5v-4a.5.5 0 0 1 1 0v2.793L15.146.146a.5.5 0 0 1 .708 0zm-12.2 1.182a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/></svg>
                <span>Call Us Today:</span>
                <a href="tel:+6281382567" className="text-yellow-300 hover:underline">
                  (+62) 813812567
                </a>
                <span>Indonesia or</span>
                <a href="tel:+61419911610" className="text-yellow-300 hover:underline">
                  (+61) 419911610
                </a>
                <span>Australia</span>
              </div>

              {/* Follow Us */}
              <div className="flex items-center gap-2">
                <span>Follow Us:</span>
                <a 
                  href="https://www.facebook.com/groups/95255317455/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-white transition-colors"
                >
                  <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                      </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <header className="sticky top-0 z-50 bg-blue-800 text-white flex flex-wrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Logo className="h-8 w-auto" />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex gap-4 md:gap-6 justify-center">
          <Link
              to="/" className="hover:underline font-bold">Home
            </Link>
            <Link
              to="/about" className="hover:underline font-bold">About Us
            </Link>
            <Link
              to="/culture" className="hover:underline font-bold">Culture
            </Link>
            <Link
              to="/galery" className="hover:underline font-bold">Gallery
            </Link>
            <Link
              to="/contact" className="hover:underline font-bold">Contact Us
            </Link>
            <Link
              to="/support" className="hover:underline font-bold">Support Us
            </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          {auth.accessToken ? (
            <>
              <Button onClick={handleLogout} className={buttonVariants({ variant: "secondary" })}>
                Log Out
              </Button>
              <Button onClick={handleDashboard} className={buttonVariants({ variant: "secondary" })}>
                Dashboard
              </Button>
            </>
          ) : (
            <>
              <Link to={"/register"} className={buttonVariants({ variant: "secondary" })}>
                Sign Up
              </Link>
              <Link to={"/login"} className={buttonVariants({ variant: "secondary" })}>
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <button
          className="sm:hidden text-white"
          onClick={handleMobileMenuToggle}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>

        {/* Mobile navigation dropdown */}
        {isMobileMenuOpen && (
          <nav className="absolute top-full left-0 w-full bg-black/50 text-white flex flex-col gap-2 p-4 rounded z-50">
            <Link
              to="/" className="hover:underline" onClick={handleMobileMenuClose}>Home
            </Link>
            <Link
              to="/about" className="hover:underline" onClick={handleMobileMenuClose}>About Us
            </Link>
            <Link
              to="/culture" className="hover:underline" onClick={handleMobileMenuClose}>Culture
            </Link>
            <Link
              to="/galery" className="hover:underline" onClick={handleMobileMenuClose}>Gallery
            </Link>
            <Link
              to="/contact" className="hover:underline" onClick={handleMobileMenuClose}>Contact Us
            </Link>
            <Link
              to="/support" className="hover:underline" onClick={handleMobileMenuClose}>Support Us
            </Link>
            
            {/* Mobile Auth Buttons */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20">
              {auth.accessToken ? (
                <>
                  <Button onClick={handleLogout} className={buttonVariants({ variant: "secondary" })}>
                    Log Out
                  </Button>
                  <Button onClick={handleDashboard} className={buttonVariants({ variant: "secondary" })}>
                    Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to={"/register"} 
                    className={buttonVariants({ variant: "secondary" })}
                    onClick={handleMobileMenuClose}
                  >
                    Sign Up
                  </Link>
                  <Link 
                    to={"/login"} 
                    className={buttonVariants({ variant: "secondary" })}
                    onClick={handleMobileMenuClose}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;