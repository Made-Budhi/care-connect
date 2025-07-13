import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    Newspaper,
    School, User, Users
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";
import NotificationProfile from "@/components/notification-profile.tsx";
import Footer from "@/components/ui/footer.tsx";

const menus = [
    {
        title: "Foster Children",
        url: "/admin/children",
        icon: <Users />
    },
    {
        title: "School List",
        url: "/admin/schools",
        icon: <School />
    },
    {
        title: "Stuart",
        url: "/admin/stuart",
        icon: <User />
    },
    {
        title: "News",
        url: "/admin/news",
        icon: <Newspaper />
    },
]

function AdminLayout() {
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

export default AdminLayout;