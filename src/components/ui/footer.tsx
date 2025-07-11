import { Link } from "react-router";
import { Link as ScrollLink } from "react-scroll";
import Logo from "@/components/care-connect-logo.tsx";

const Footer = () => {
  return (
    <>
      {/* Contact Section */}
      <section id="contact" className="bg-blue-900 text-white py-12 relative">
        {/* Scroll to top button */}
        <ScrollLink
          to="main"
          smooth={true}
          duration={800}
          className="absolute right-6 top-6 bg-white text-blue-900 hover:bg-blue-100 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all cursor-pointer"
          aria-label="Scroll to top"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </ScrollLink>
        
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bali School Kids Column */}
            <div>
              {/* <h3 className="text-xl font-bold mb-4">Bali School Kids</h3>  Bagusan logo atau text biasa?*/}
              <Logo className="h-8 w-auto mb-3" />
              <p className="mb-4">
                Rotary Clubs of Boulder with support from Swan Rotary Club and the Rotary Cliof Bali-Denpasar
              </p>
              
              {/* Social Media Icons */}
              <div className="flex space-x-4 mt-6">
                {/* WhatsApp Icon */}
                <a 
                  href="https://wa.me/628123812567" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-colors"
                  aria-label="Contact us on WhatsApp"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.479 1.184.567c.173.087.289.13.332.202.043.72.043.419-.101.824z"/>
                  </svg>
                </a>
                
                {/* Facebook Icon */}
                <a 
                  href="https://www.facebook.com/groups/95255317455/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-8 w-8" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Australia Column */}
            <div>
              <h3 className="text-xl font-bold mb-4">Australia</h3>
              <p className="mb-2">Rotary Club of Boulder 79 Burt St</p>
              <p className="mb-2">Boulder WA</p>
              <p className="mb-4">Stuart Fleming</p>
              <div className="flex items-center mb-2">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span>(+61) 0417 958 415</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <a href="mailto:info@balischoolkids.org" className="hover:underline">info@balischoolkids.org</a>
              </div>
            </div>
            
            {/* Indonesia Column */}
            <div>
              <h3 className="text-xl font-bold mb-4">Indonesia</h3>
              <p className="mb-1">Yayasan Pelangi Anak-Anak Bali</p>
              <p className="mb-1">Now changed to Yayasan Rotary Bali Denpasar</p>
              <p className="mb-1">Jln. Noja 106/132 Denpasar, Bali Indonesia</p>
              <p className="mb-4">80237</p>
              <p className="mb-2">Agung Adnyana</p>
              <div className="flex items-center mb-2">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </span>
                <span>(+62) 8123812567</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <a href="mailto:agung@balischoolkids.org" className="hover:underline">agung@balischoolkids.org</a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Links Section */}
      <section className="bg-blue-800 py-4 text-white text-sm">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="uppercase mb-2 sm:mb-0">YAYASAN PELANGI ANAK-ANAK BALI NOW CHANGED TO YAYASAN ROTARY BALI DENPASAR</p>
          </div>
          <div>
            <Link to="/faq" className="hover:underline uppercase">FREQUENTLY ASKED QUESTIONS</Link>
          </div>
        </div>       
      </section>

      {/* Copyright Footer */}
      <footer className="bg-blue-800 text-white py-3 text-center text-sm border-t border-blue-700">
        <p>Copyright © 2018, BALI SCHOOL KIDS, ALL RIGHTS RESERVED</p>
      </footer>
    </>
  );
};

export default Footer;