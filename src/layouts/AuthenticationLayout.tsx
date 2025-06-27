import {Outlet, useNavigate} from "react-router";
import CareConnect from "@/components/care-connect-logo.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import {useEffect} from "react";

function AuthenticationLayout() {
    const { auth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.accessToken) {
            // Render dashboard based on a user role
            switch (auth.role) {
                case 'sponsor':
                    navigate('/sponsor/children');
                    break;
                case 'stuart':
                    navigate('/stuart/funding');
                    break;
                case 'school':
                    navigate('/school/children');
                    break;
                case 'admin':
                    navigate('/admin/children');
                    break;
                default:
                    // If role is not recognized, redirect to unauthorized page
                    navigate('/unauthorized');
            }
        }
    }, [auth, navigate]);

    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            {/* Image on the left */}
            <div className="relative hidden bg-[url('/pictures/children.png')] bg-cover bg-center p-20
            bg-black/80 bg-blend-multiply text-white lg:flex flex-col justify-between">

                <CareConnect />

                <h1 className={"font-bold text-3xl"}>Watch them grow, every step of the way.</h1>

            </div>

            {/* Container on the right */}
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">

                    <CareConnect className={"lg:hidden"} />

                </div>

                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">

                        <Outlet />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default AuthenticationLayout;