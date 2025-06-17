import {Button, buttonVariants} from "@/components/ui/button.tsx";
import {Link, useNavigate} from "react-router";
import useAuth from "@/hooks/useAuth.tsx";
import useLogout from "@/hooks/useLogout.tsx";

function LandingPage() {
    const { auth } = useAuth();
    const logout = useLogout();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    }

    const handleDashboard = () => {
        switch (auth.role) {
            case 'sponsor':
                navigate('/sponsor/children');
                break;
            case 'stuart':
                navigate('/stuart/children');
                break;
            case 'school':
                navigate('/school/children');
                break;
            case 'admin':
                navigate('/admin/children');
                break;
            default:
                // If the role is not recognized, redirect to unauthorized page
                navigate('/unauthorized');
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4 items-start">
            <h1 className="text-2xl font-bold">Care Connect</h1>
            <div className="flex gap-2">

                {auth.accessToken ? (
                    <>
                        <Button onClick={handleLogout}>Log Out</Button>
                        <Button onClick={handleDashboard}>Dashboard</Button>
                    </>
                ) : (
                    <Link to={"/login"} className={buttonVariants({variant: "default"})}>Login</Link>
                )}
            </div>
            
            <div>
                {auth.accessToken ? <p>You are logged in.</p> : <p>You are not logged in.</p>}
            </div>
        </div>
    )
}

export default LandingPage
