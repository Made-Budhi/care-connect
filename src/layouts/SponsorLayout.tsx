import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    BookOpenText,
    CreditCard,
    HandCoins,
    Users,
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";
import NotificationProfile from "@/components/notification-profile.tsx";

const menus = [
    {
        title: "Foster Children",
        url: "/sponsor/children",
        icon: <Users />
    },
    {
        title: "Funding Submissions",
        url: "/sponsor/funding",
        icon: <HandCoins />
    },
    {
        title: "Payments",
        url: "/sponsor/payments",
        icon: <CreditCard />
    },
    {
        title: "Activities",
        url: "/sponsor/activities",
        icon: <BookOpenText />
    }
]

function SponsorLayout() {
    return(
        <SidebarProvider>
            <AppSidebar menus={menus}/>
            <SidebarInset className={"bg-cc-background p-3"}>
                {/* Header of the page */}
                <div className={"flex justify-between items-center"}>
                    <SidebarTrigger className={"justify-start"} />
                    <NotificationProfile />
                </div>

                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    )
}

export default SponsorLayout;