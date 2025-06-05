import {Outlet} from "react-router";
import CareConnect from "@/components/care-connect-logo.tsx";

function AuthenticationLayout() {
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