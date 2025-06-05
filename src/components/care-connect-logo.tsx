import { Link } from "react-router";
import { GalleryVerticalEnd } from "lucide-react";

interface CareConnectProps {
    className?: string;
}

const CareConnect: React.FC<CareConnectProps> = ({ className = "" }) => {
    return (
        <Link to={"/"} className={`flex items-center gap-2 font-medium ${className}`}>
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                {/* Logo. TODO: Replace with CareConnect's logo */}
                <GalleryVerticalEnd className="size-4" />
            </div>
            Care Connect
        </Link>
    );
};

export default CareConnect;