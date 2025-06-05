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

const menus = [
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
        title: "Foster Children",
        url: "/admin/children",
        icon: <Users />
    },
    {
        title: "Newsletters",
        url: "/admin/newsletters",
        icon: <Newspaper />
    },
]

function AdminLayout() {
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

export default AdminLayout;