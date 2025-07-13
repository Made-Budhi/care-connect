import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

function ContactPage(){
    useEffect(() =>{
        document.title = 'Bali School Kids | Contact';
    }, []);

    const navigate = useNavigate();
    const handleNavigation = () => {
        navigate("/")
    }

    const form = useForm<ContactFormData>({
        defaultValues: {
            name: "",
            email: "",
            message: "",
        },
    });

    const onSubmit = (data: ContactFormData) => {
        console.log(data);
        // Handle form submission here
        alert("Message sent successfully!");
        form.reset();
    };

    return(
        <div id="main" className="min-h-screen flex flex-col">
            <Navbar onNavigate={handleNavigation}/>

            {/* Contact Content */}
            <section id="main" className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Indonesia Contact Card */}
                        <div className="bg-blue-800 text-white rounded-lg p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-4">Indonesia</h2>
                                <p className="mb-6 text-blue-100">
                                    Yayasan Pelangi Anak-Anak Bali<br/>
                                    Now changed to yayasan Rotary<br/>
                                    Bali Denpasar
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path
                                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>

                                        <span>(+62) 812382567</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <span>agung@balischoolkids.org</span>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center mt-1">
                                            <svg className="w-8 h-8 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v6M9.5 9A2.5 2.5 0 0 1 12 6.5"/>
                                            </svg>


                                        </div>
                                        <div>
                                            <p>Jalan Noja No. 106/132</p>
                                            <p>Denpasar - Bali 80237</p>
                                            <p>Indonesia</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative circles */}
                            <div className="absolute hidden sm:flex bottom-0 right-0 w-32 h-32 bg-green-300/60 rounded-full transform translate-x-16 translate-y-16"></div>
                            <div className="absolute hidden sm:flex bottom-8 right-8 w-16 h-16 bg-green-500/75 rounded-full"></div>
                        </div>

                        {/* Australia Contact Card */}
                        <div className="bg-blue-800 text-white rounded-lg p-8 relative overflow-hidden">
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-4">Australia</h2>
                                <p className="mb-6 text-blue-100">
                                    Rotary Club of Boulder
                                </p>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-semibold mb-2">Stuart Fleming</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path
                                            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                        </svg>
                                        <span>(+61) 0417958415</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="4" width="20" height="16" rx="2" />
                                            <polyline points="22,6 12,13 2,6" />
                                            </svg>

                                        </div>
                                        <span>info@balischoolkids.org</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Decorative circles */}
                            <div className="absolute hidden sm:flex bottom-0 right-0 w-32 h-32 bg-green-300/60 rounded-full transform translate-x-16 translate-y-16"></div>
                            <div className="absolute hidden sm:flex bottom-8 right-8 w-16 h-16 bg-green-500/75 rounded-full"></div>
                        </div>

                        {/* Contact Form */}
                        <div className="bg-white rounded-lg p-8 shadow-lg">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        rules={{ required: "Name is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="Enter your name" 
                                                        className="border-gray-300 focus:border-blue-500"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        rules={{ 
                                            required: "Email is required",
                                            pattern: {
                                                value: /^\S+@\S+$/i,
                                                message: "Please enter a valid email"
                                            }
                                        }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="email"
                                                        placeholder="Enter your email" 
                                                        className="border-gray-300 focus:border-blue-500"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        rules={{ required: "Message is required" }}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Message</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Write your message..."
                                                        className="border-gray-300 focus:border-blue-500 min-h-[120px]"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button 
                                        type="submit" 
                                        className="w-full bg-black hover:bg-gray-800 text-white py-3"
                                    >
                                        Send Message
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privacy Notice */}
            <section className="bg-blue-800 text-white py-6">
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

export default ContactPage