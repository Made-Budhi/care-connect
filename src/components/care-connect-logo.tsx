import { Link } from "react-router";

interface CareConnectProps {
    className?: string;
}

const CareConnect: React.FC<CareConnectProps> = ({ className = "" }) => {
    return (
        <Link to={"/"} className={`flex items-center gap-2 font-medium ${className}`}>
            <div className="flex h-8 w-auto justify-cente items-center">
                <img src="/pictures/logo-web-board.jpg" alt="CareConnect Logo" className="h-8 w-auto object-contain" />
            </div>
        </Link>
    );
};

export default CareConnect;