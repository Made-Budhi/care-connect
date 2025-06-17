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
            <SidebarInset className={"bg-cc-background"}>
                {/* Header of the page */}
                <div className={"sticky top-0 flex justify-between items-center bg-cc-background/50 backdrop-blur-lg px-3"}>
                    <SidebarTrigger className={""} />
                    <NotificationProfile />
                </div>

                <div className="bg-cc-background p-3">
                    <Outlet />
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

export default SponsorLayout;