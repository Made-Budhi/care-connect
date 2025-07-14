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
import {LogOut} from "lucide-react";
import useAuth from "@/hooks/useAuth.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import useLogout from "@/hooks/useLogout.tsx";
import {UserProfileDialog} from "@/components/user-profile-dialog.tsx";
import CareConnect from "@/components/care-connect-logo.tsx";

interface MenuItem {
    title: string;
    url: string;
    icon: JSX.Element;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    menus: MenuItem[];
}

// const secondaryMenu = [
//     {
//         title: "Notifications",
//         url: "/notifications",
//         icon: <Bell />,
//     }
// ] satisfies MenuItem[];

export function AppSidebar({ menus, ...props }: AppSidebarProps) {
    const location = useLocation()
    const {auth} = useAuth()
    const logout = useLogout();
    const navigate = useNavigate();
    const initials = auth?.session?.user?.user_metadata.name.split(" ").map(function (word: string[]) {
        return word[0];
    }).slice(0, 2).join("");

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
                            <CareConnect />
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
                        {/*{secondaryMenu.map((menu) => (*/}
                        {/*    <SidebarMenu key={menu.url}>*/}
                        {/*        <SidebarMenuItem key={menu.title}>*/}
                        {/*            <SidebarMenuButton className={"py-5 font-semibold"} asChild>*/}
                        {/*                <NavLink to={menu.url} end className={(location.pathname.startsWith(menu.url) ?*/}
                        {/*                    "bg-cc-primary-darker text-white" : "")}>*/}
                        {/*                    {menu.icon}*/}
                        {/*                    <span>{menu.title}</span>*/}
                        {/*                </NavLink>*/}
                        {/*            </SidebarMenuButton>*/}
                        {/*        </SidebarMenuItem>*/}
                        {/*    </SidebarMenu>*/}
                        {/*))}*/}
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
                <UserProfileDialog>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full" variant={"outline"}>
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={auth?.session?.user?.user_metadata.image || undefined} alt={auth?.session?.user?.user_metadata.name} className={"rounded-lg"}/>
                                    <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                                </Avatar>

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{auth?.session?.user?.user_metadata.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{auth?.session?.user?.user_metadata.email}</span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </UserProfileDialog>
            </SidebarFooter>
        </Sidebar>
    )
}