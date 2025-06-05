import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    Award,
    FileInput, IdCard,
    Users
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";

const menus = [
    {
        title: "Foster Children",
        url: "/school/children",
        icon: <Users />
    },
    {
        title: "Activity Requests",
        url: "/school/funding",
        icon: <FileInput />
    },
    {
        title: "Report Cards",
        url: "/school/payments",
        icon: <IdCard />
    },
    {
        title: "Achievement Records",
        url: "/school/activities",
        icon: <Award />
    }
]

function SchoolLayout() {
    return(
        <SidebarProvider>
            <AppSidebar menus={menus}/>
            <SidebarInset>
                <SidebarTrigger />
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}

export default SchoolLayout;