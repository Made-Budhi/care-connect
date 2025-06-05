import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Bell, User} from "lucide-react";

function NotificationProfile() {
    return (
        <div className={"flex items-center"}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant={"ghost"}><Bell /></Button>
                </PopoverTrigger>

                <PopoverContent>
                    <h1>Notification</h1>
                </PopoverContent>
            </Popover>

            <Button variant={"ghost"}>
                <User />
            </Button>
        </div>
    )
}

export default NotificationProfile;