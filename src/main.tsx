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
// import PersistLogin from "@/layouts/PersistLogin.tsx";
import UnauthorizedPage from "@/pages/UnauthorizedPage.tsx";
import SponsorLayout from "@/layouts/SponsorLayout.tsx";
import ChildrenList from "@/pages/sponsor/ChildrenList.tsx";
import FundingSubmissions from "@/pages/sponsor/FundingSubmissions.tsx";
import Payments from "@/pages/sponsor/Payments.tsx";
import Activities from "@/pages/sponsor/Activities.tsx";
import ChildDetail from "@/pages/multi-role/ChildDetail.tsx";
import FundingSubmissionDetail from "@/pages/multi-role/FundingSubmissionDetail.tsx";
import ChildAchievements from "@/pages/multi-role/ChildAchievements.tsx";
import ChildReportCards from "@/pages/multi-role/ChildReportCards.tsx";
import AchievementDetail from "@/pages/multi-role/AchievementDetail.tsx";
import ActivityDetail from "@/pages/multi-role/ActivityDetail.tsx";
import AddActivitySubmissionPage from "@/pages/sponsor/AddActivity.tsx";
import AddFundingSubmission from "@/pages/sponsor/AddFundingSubmission.tsx";
import FundingSubmissionApprovalPage from "@/pages/stuart/FundingSubmissionApproval.tsx";
import StuartLayout from "@/layouts/StuartLayout.tsx";
import PaymentProofApproval from "@/pages/stuart/PaymentProofApproval.tsx";
import AllChildrenList from "@/pages/multi-role/AllChildrenList.tsx";
import AllSchoolList from "@/pages/multi-role/AllSchoolList.tsx";
import SchoolDetailPage from "@/pages/multi-role/SchoolDetail.tsx";
import SchoolLayout from "@/layouts/SchoolLayout.tsx";
import SchoolChildrenList from "@/pages/school/SchoolChildrenList.tsx";
import AddEditChildren from "@/pages/school/AddEditChildren.tsx";
import AddEditAchievement from "@/pages/school/AddEditAchievement.tsx";
import ActivitySubmissionApprovalPage from "@/pages/school/ActivityApproval.tsx";
import AddEditReportCards from "@/pages/school/AddEditReportCards.tsx";
import AdminLayout from "@/layouts/AdminLayout.tsx";
import AddEditSchool from "@/pages/admin/AddEditSchool.tsx";
import Stuarts from "@/pages/admin/Stuarts.tsx";
import NewsListPage from "@/pages/admin/News.tsx";
import AddEditNews from "@/pages/admin/AddEditNews.tsx";
import AddStuart from "@/pages/admin/AddStuart.tsx";
// import UserProfile from "@/pages/multi-role/UserProfile.tsx";

const ADMIN = 'admin'
const SPONSOR = 'sponsor'
const SCHOOL = 'school'
const STUART = 'stuart'

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

    // {
    //     element: <PersistLogin/>,
    //     children: [
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

                            {path: "/sponsor/children/view/:uuid", element: <ChildDetail breadcrumbs={[
                                    {name: "Foster Child List", url: "/sponsor/children"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/sponsor/children/:uuid/achievements", element: <ChildAchievements breadcrumbs={[
                                    {name: "Foster Child List", url: "/sponsor/children"},
                                    {name: "Achievements"},
                                ]}/>},
                            {path: "/sponsor/children/achievements/:uuid", element: <AchievementDetail breadcrumbs={[
                                    {name: "Foster Child List", url: "/sponsor/children"},
                                    {name: "Achievements"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/sponsor/children/:uuid/report-cards", element: <ChildReportCards breadcrumbs={[
                                    {name: "Foster Child List", url: "/sponsor/children"},
                                    {name: "Report Cards"},
                                ]} />},

                            {path: "/sponsor/funding", element: <FundingSubmissions />},
                            {path: "/sponsor/funding/view/:uuid", element: <FundingSubmissionDetail mode={"view"} breadcrumbs={[
                                    { name: "Funding Submissions", url: "/sponsor/funding/" },
                                    { name: "Detail" },
                                ]} />},
                            {path: "/sponsor/funding/add", element: <AddFundingSubmission />},

                            {path: "/sponsor/payments", element: <Payments />},

                            {path: "/sponsor/activities", element: <Activities />},
                            {path: "/sponsor/activities/:uuid", element: <ActivityDetail breadcrumbs={[
                                    {name: "Activities", url: "/sponsor/activities"},
                                    {name: "Detail"}
                                ]} />},
                            {path: "/sponsor/activities/add", element: <AddActivitySubmissionPage />},
                        ]
                    }
                ]
            },
            {
                element: <ProtectedRoute roles={[STUART]}/>,
                children: [
                    {
                        element: <StuartLayout />,
                        children: [
                            {path: "/stuart/funding", element: <FundingSubmissionApprovalPage />},
                            {path: "/stuart/funding/:uuid", element: <FundingSubmissionDetail mode={"edit"} breadcrumbs={[
                                    { name: "Funding Submissions", url: "/stuart/funding/" },
                                    { name: "Detail" },
                                ]} />},

                            {path: "/stuart/payments", element: <PaymentProofApproval />},

                            {path: "/stuart/children", element: <AllChildrenList />},
                            {path: "/stuart/children/:uuid", element: <ChildDetail breadcrumbs={[
                                    {name: "Foster Child List", url: "/stuart/children"},
                                    {name: "Detail"}
                                ]} />},
                            {path: "/stuart/children/:uuid/achievements", element: <ChildAchievements breadcrumbs={[
                                    {name: "Foster Child List", url: "/stuart/children"},
                                    {name: "Achievements"},
                                ]} />},
                            {path: "/stuart/children/achievements/:uuid", element: <AchievementDetail breadcrumbs={[
                                    {name: "Foster Child List", url: "/stuart/children"},
                                    {name: "Achievements"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/stuart/children/:uuid/report-cards", element: <ChildReportCards breadcrumbs={[
                                    {name: "Foster Child List", url: "/stuart/children"},
                                    {name: "Report Cards"},
                                ]} />},
                            {path: "/stuart/children/report-cards/:uuid", element: <ChildReportCards breadcrumbs={[
                                    {name: "Foster Child List", url: "/stuart/children"},
                                    {name: "Report Cards"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/stuart/schools", element: <AllSchoolList />},
                            {path: "/stuart/schools/:uuid", element: <SchoolDetailPage />}
                        ]
                    }
                ]
            },
            {
                element: <ProtectedRoute roles={[SCHOOL]}/>,
                children: [
                    {
                        element: <SchoolLayout />,
                        children: [
                            {path: "/school/children", element: <SchoolChildrenList />},
                            {path: "/school/children/:uuid", element: <ChildDetail breadcrumbs={[
                                    {name: "Child List", url: "/school/children"},
                                    {name: "Detail"}
                                ]} />},
                            {path: "/school/children/add", element: <AddEditChildren />},
                            {path: "/school/children/:uuid/edit", element: <AddEditChildren />},

                            {path: "/school/children/:uuid/achievements", element: <ChildAchievements breadcrumbs={[
                                    {name: "Child List", url: "/school/children"},
                                    {name: "Achievements"},
                                ]} />},
                            {path: "/school/children/achievements/:uuid", element: <AchievementDetail breadcrumbs={[
                                    {name: "Child List", url: "/school/children"},
                                    {name: "Achievements"},
                                    {name: "Detail"}
                                ]} />},
                            {path: "/school/children/:childUuid/achievements/add", element: <AddEditAchievement mode={"add"} />},
                            {path: "/school/children/achievements/:achievementUuid/edit", element: <AddEditAchievement mode={"edit"} />},

                            {path: "/school/activities", element: <ActivitySubmissionApprovalPage />},
                            {path: "/school/activities/:uuid", element: <ActivityDetail breadcrumbs={[
                                    {name: "Activities", url: "/school/activities"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/school/children/:uuid/report-cards", element: <ChildReportCards breadcrumbs={[
                                    {name: "Child List", url: "/school/children"},
                                    {name: "Report Cards"},
                                ]} />},
                            {path: "/school/children/:childUuid/report-cards/add", element: <AddEditReportCards mode={"add"} />},
                            {path: "/school/children/report-cards/:reportCardUuid/edit", element: <AddEditReportCards mode={"edit"} />},
                        ]
                    }
                ]
            },
            {
                element: <ProtectedRoute roles={[ADMIN]}/>,
                children: [
                    {
                        element: <AdminLayout />,
                        children: [
                            {path: "/admin/schools", element: <AllSchoolList />},
                            {path: "/admin/schools/:uuid", element: <SchoolDetailPage />},
                            {path: "/admin/schools/:uuid/children", element: <SchoolChildrenList />},
                            {path: "/admin/schools/add", element: <AddEditSchool mode={"add"} />},
                            {path: "/admin/schools/:uuid/edit", element: <AddEditSchool mode={"edit"} />},

                            {path: "/admin/children", element: <AllChildrenList />},
                            {path: "/admin/children/:uuid", element: <ChildDetail breadcrumbs={[
                                    {name: "Child List", url: "/admin/children"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/admin/children/:uuid/achievements", element: <ChildAchievements breadcrumbs={[
                                    {name: "Child List", url: "/admin/children"},
                                    {name: "Achievements"},
                                ]} />},
                            {path: "/admin/children/achievements/:uuid", element: <AchievementDetail breadcrumbs={[
                                    {name: "Child List", url: "/admin/children"},
                                    {name: "Achievements"},
                                    {name: "Detail"}
                            ]} />},

                            {path: "/admin/children/:uuid/report-cards", element: <ChildReportCards breadcrumbs={[
                                    {name: "Child List", url: "/admin/children"},
                                    {name: "Report Cards"},
                                ]} />},
                            {path: "/admin/children/report-cards/:uuid", element: <ChildReportCards breadcrumbs={[
                                    {name: "Child List", url: "/admin/children"},
                                    {name: "Report Cards"},
                                    {name: "Detail"}
                                ]} />},

                            {path: "/admin/stuart", element: <Stuarts />},
                            {path: "/admin/stuarts/add", element: <AddStuart />},

                            {path: "/admin/news", element: <NewsListPage />},
                            {path: "/admin/news/:uuid/edit", element: <AddEditNews mode={"edit"} />},
                            {path: "/admin/news/add", element: <AddEditNews mode={"add"} />},
                        ]
                    }
                ]
            },
            // {
            //     element: <ProtectedRoute roles={[ADMIN, SPONSOR, SCHOOL, STUART]}/>,
            //     children: [
            //         {path: "/profile/me", element: <UserProfile />}
            //     ]
            // }

        // ]}
])

// Initialize MSW and then render the app
enableMocking().then(() => {
    createRoot(document.getElementById('root')!).render(
         <AuthProvider>
            <StrictMode>
                <RouterProvider router={router}/>
                <Toaster richColors />
            </StrictMode>
         </AuthProvider>
    )
})
