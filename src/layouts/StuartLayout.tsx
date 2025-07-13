import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

import {
    // CreditCard,
    HandCoins,
    School,
    Users
} from "lucide-react"

import {Outlet} from "react-router";
import {AppSidebar} from "@/layouts/sidebars/AppSidebar.tsx";
import NotificationProfile from "@/components/notification-profile.tsx";
import Footer from "@/components/ui/footer.tsx";

const menus = [
    // {
    //     title: "Funding Applications",
    //     url: "/stuart/funding",
    //     icon: <HandCoins />
    // },
    // {
    //     title: "Payment Verifications",
    //     url: "/stuart/payments",
    //     icon: <CreditCard />
    // },
    {
      title: "Funding",
      url: "/stuart/funding",
      icon: <HandCoins />,
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

export default StuartLayout;