import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    FileInput,
    Users
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";
import NotificationProfile from "@/components/notification-profile.tsx";
import Footer from "@/components/ui/footer.tsx";

const menus = [
    {
        title: "Foster Children",
        url: "/school/children",
        icon: <Users />
    },
    {
        title: "Activity Requests",
        url: "/school/activities",
        icon: <FileInput />
    },
    // {
    //     title: "Report Cards",
    //     url: "/school/payments",
    //     icon: <IdCard />
    // },
    // {
    //     title: "Achievement Records",
    //     url: "/school/activities",
    //     icon: <Award />
    // }
]

function SchoolLayout() {
    return(
        <SidebarProvider>
            <AppSidebar menus={menus}/>
            <SidebarInset className={"bg-cc-background"}>
                {/* Header of the page */}
                <div className={"sticky top-0 flex justify-between items-center bg-cc-background/50 backdrop-blur-lg px-3"}>
                    <SidebarTrigger className={""} />
                    <NotificationProfile />
                </div>

                <div className="min-h-screen bg-cc-background p-3 mb-5">
                    <Outlet />
                </div>

                <Footer />
            </SidebarInset>
        </SidebarProvider>
    )
}

export default SchoolLayout;