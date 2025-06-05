import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    CreditCard,
    HandCoins,
    School,
    Users
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";

const menus = [
    {
        title: "Funding Applications",
        url: "/stuart/fundings",
        icon: <HandCoins />
    },
    {
        title: "Payment Verifications",
        url: "/stuart/payments",
        icon: <CreditCard />
    },
    {
        title: "School List",
        url: "/stuart/schools",
        icon: <School />
    },
    {
        title: "Foster Children",
        url: "/stuart/children",
        icon: <Users />
    }
]

function StuartLayout() {
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

export default StuartLayout;