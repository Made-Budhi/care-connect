"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth.tsx";
// import {Button} from "@/components/ui/button";
// import {Link} from "react-router";

export function UserProfileDialog({children}: { children: React.ReactNode }) {
    const {auth} = useAuth();

    // Helper to get initials from a name
    const getInitials = (name: string = "") => {
        return name.split(" ").map(word => word[0]).slice(0, 2).join("").toUpperCase();
    };

    const userName = auth?.session?.user?.user_metadata?.name || "User";
    const userEmail = auth?.session?.user?.user_metadata?.email || "No email provided";
    const userAvatarUrl = auth?.session?.user?.user_metadata?.image || undefined;
    const userInitials = getInitials(userName);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>
                        Your personal account details.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-4 py-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={userAvatarUrl} alt={userName}/>
                        <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-lg font-semibold">{userName}</p>
                        <p className="text-sm text-muted-foreground">{userEmail}</p>
                    </div>
                </div>
                {/* Optional: Add a button to a more detailed profile page */}
                {/*<div className="flex justify-end">*/}
                {/*    <Button asChild variant="outline">*/}
                {/*        <Link to="/profile/me/edit">Edit Full Profile</Link>*/}
                {/*    </Button>*/}
                {/*</div>*/}
            </DialogContent>
        </Dialog>
    );
}
