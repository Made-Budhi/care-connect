import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Link as ScrollLink } from "react-scroll";
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
    <header className="sticky top-0 z-50 bg-blue-800 text-white flex flex-wrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
      {/* Logo */}
      <div className="flex items-center">
        <Logo className="h-8 w-auto" />
      </div>

      {/* Desktop Navigation */}
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
        <ScrollLink
          to="contact"
          smooth={true}
          duration={500}
          className="hover:underline cursor-pointer"
        >
          Contact
        </ScrollLink>
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
          <ScrollLink
            to="main"
            smooth={true}
            duration={500}
            className="hover:underline cursor-pointer"
            onClick={handleMobileMenuClose}
          >
            Home
          </ScrollLink>
          <ScrollLink
            to="about"
            smooth={true}
            duration={500}
            className="hover:underline cursor-pointer"
            onClick={handleMobileMenuClose}
          >
            About
          </ScrollLink>
          <ScrollLink
            to="program"
            smooth={true}
            duration={500}
            className="hover:underline cursor-pointer"
            onClick={handleMobileMenuClose}
          >
            Program
          </ScrollLink>
          <ScrollLink
            to="contact"
            smooth={true}
            duration={500}
            className="hover:underline cursor-pointer"
            onClick={handleMobileMenuClose}
          >
            Contact
          </ScrollLink>
          
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
  );
};

export default Navbar;