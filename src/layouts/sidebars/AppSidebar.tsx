"use client"

import * as React from "react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"

import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup, SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import {Link, NavLink, useLocation, useNavigate} from "react-router"
import {type JSX} from "react"
import {Bell, GalleryVerticalEnd, LogOut} from "lucide-react";
import useAuth from "@/hooks/useAuth.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import useLogout from "@/hooks/useLogout.tsx";

interface MenuItem {
    title: string;
    url: string;
    icon: JSX.Element;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    menus: MenuItem[];
}

const secondaryMenu = [
    {
        title: "Notifications",
        url: "/notifications",
        icon: <Bell />,
    }
] satisfies MenuItem[];

export function AppSidebar({ menus, ...props }: AppSidebarProps) {
    const location = useLocation()
    const {auth} = useAuth()
    const logout = useLogout();
    const navigate = useNavigate();
    const initials = auth?.name?.split(" ").map(word => word[0]).slice(0, 2).join("");

    const handleLogout = async () => {
        await logout();
        navigate("/");
    }

    return (
        <Sidebar {...props} collapsible={"icon"}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" variant={"outline"} asChild>
                        <Link to={"/"}>
                            <div
                                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <GalleryVerticalEnd className="size-4"/>
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate text-lg font-semibold">
                                  Care Connect
                                </span>
                            </div>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenu>
                <Separator />
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup key={"main-content"}>
                    <SidebarGroupContent className={"space-y-2"}>
                        {menus.map((menu) => (
                            <SidebarMenu key={menu.url}>
                                <SidebarMenuItem key={menu.title}>
                                    <SidebarMenuButton className={"py-5 font-semibold"} asChild>
                                        <NavLink to={menu.url} end className={(location.pathname.startsWith(menu.url) ?
                                            "bg-cc-primary-darker text-white" : "")}>
                                            {menu.icon}
                                            <span>{menu.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        ))}
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup key={"secondary-content"} className={"mt-auto"}>
                    <SidebarGroupContent className={"space-y-2"}>
                        {secondaryMenu.map((menu) => (
                            <SidebarMenu key={menu.url}>
                                <SidebarMenuItem key={menu.title}>
                                    <SidebarMenuButton className={"py-5 font-semibold"} asChild>
                                        <NavLink to={menu.url} end className={(location.pathname.startsWith(menu.url) ?
                                            "bg-cc-primary-darker text-white" : "")}>
                                            {menu.icon}
                                            <span>{menu.title}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        ))}
                        {/*Log Out*/}
                        <SidebarMenu>
                            <SidebarMenuItem key={"logout"}>
                                <SidebarMenuButton onClick={handleLogout} className={"py-5 font-semibold hover:cursor-pointer hover:bg-red-500 bg-red-500 text-white"}>
                                    <LogOut />
                                    <span>Log Out</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <Separator />
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" variant={"outline"} asChild>
                            <Link to={"/profile/me"}>
                                <Avatar className="h-8 w-8 rounded-lg grayscale">
                                    <AvatarImage src={""} alt={auth.name}/>
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{auth.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{auth.email}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}