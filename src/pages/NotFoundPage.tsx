import {Link} from "react-router";
import {buttonVariants} from "@/components/ui/button.tsx";

function NotFoundPage() {
    return(
        <div>
            <p>The page you're looking for doesn't exist.</p>

            <Link to={"/"} className={buttonVariants({variant: "default"})}>Take me back.</Link>
        </div>
    )
}

export default NotFoundPage;