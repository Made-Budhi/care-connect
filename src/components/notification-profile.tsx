// import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {User} from "lucide-react";
import {UserProfileDialog} from "@/components/user-profile-dialog.tsx";

function NotificationProfile() {
    return (
        <div className={"flex items-center"}>
            {/*<Popover>*/}
            {/*    <PopoverTrigger asChild>*/}
            {/*        <Button variant={"ghost"}><Bell /></Button>*/}
            {/*    </PopoverTrigger>*/}

            {/*    <PopoverContent>*/}
            {/*        <h1>Notification</h1>*/}
            {/*    </PopoverContent>*/}
            {/*</Popover>*/}

            <UserProfileDialog>
                <Button variant={"ghost"}>
                    <User />
                </Button>
            </UserProfileDialog>
        </div>
    )
}

export default NotificationProfile;