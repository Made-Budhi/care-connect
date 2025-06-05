import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import LandingPage from './pages/LandingPage.tsx'
import {createBrowserRouter, RouterProvider} from "react-router";
import NotFoundPage from "@/pages/NotFoundPage.tsx";
import {Login} from "@/pages/auth/Login.tsx";
import AuthenticationLayout from "@/layouts/AuthenticationLayout.tsx";
import Register from "@/pages/auth/Register.tsx";
import {AuthProvider} from "@/context/AuthContext";
import ProtectedRoute from "@/layouts/ProtectedRoute.tsx";
import ForgotPassword from "@/pages/auth/ForgotPassword.tsx";
import { Toaster } from "sonner"
import PersistLogin from "@/layouts/PersistLogin.tsx";
import UnauthorizedPage from "@/pages/UnauthorizedPage.tsx";
import SponsorLayout from "@/layouts/SponsorLayout.tsx";
import ChildrenList from "@/pages/sponsor/ChildrenList.tsx";
import FundingSubmissions from "@/pages/sponsor/FundingSubmissions.tsx";
import Payments from "@/pages/sponsor/Payments.tsx";
import Activities from "@/pages/sponsor/Activities.tsx";
import ViewOrEditChild from "@/pages/multi-role/ViewOrEditChild.tsx";

// const ADMIN = 'admin'
const SPONSOR = 'sponsor'
// const SCHOOL = 'school'
// const STUART = 'stuart'

// Import MSW worker
async function enableMocking() {
    if (import.meta.env.VITE_DEV === 'true') {
        const {worker} = await import('./mocks/browser');
        return worker.start({
            onUnhandledRequest: 'bypass',
        });
    }
    return Promise.resolve();
}

const router = createBrowserRouter([


    // Authentication paths
    {
        element: <AuthenticationLayout/>,
        children: [
            // TODO:Authentication-related paths go here
            {path: "/login", element: <Login/>},
            {path: "/register", element: <Register/>},
            {path: "/forgot-password", element: <ForgotPassword/>},
        ]
    },

    {
        element: <PersistLogin/>,
        children: [
            // Path to a path that doesn't exist
            {path: "*", element: <NotFoundPage/>},
            // Path to unauthorized page
            {path: "/unauthorized", element: <UnauthorizedPage/>},
            // Home path
            {path: "/", element: <LandingPage/>},

            {
                element: <ProtectedRoute roles={[SPONSOR]}/>,
                children: [
                    {
                        element: <SponsorLayout />,
                        children: [
                            {path: "/sponsor/children", element: <ChildrenList />},
                            {path: "/sponsor/children/view/:uuid", element: <ViewOrEditChild />},
                            {path: "/sponsor/funding", element: <FundingSubmissions />},
                            {path: "/sponsor/payments", element: <Payments />},
                            {path: "/sponsor/activities", element: <Activities />},
                        ]
                    }
                ]
            }
        ]
    }
])

// Initialize MSW and then render the app
enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
         <AuthProvider>
            <StrictMode>
                <RouterProvider router={router}/>
                <Toaster richColors />
            </StrictMode>,
         </AuthProvider>
    )
})
