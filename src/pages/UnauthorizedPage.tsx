"use client"

import { Button } from "@/components/ui/button.tsx";
import { Link, useNavigate } from "react-router";
import { ShieldAlert } from "lucide-react";

function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-md text-center">
                <ShieldAlert className="mx-auto h-16 w-16 text-destructive" />
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    403 - Access Denied
                </h1>
                <p className="mt-4 text-muted-foreground">
                    You do not have the necessary permissions to access this page. Please contact an administrator if you believe this is an error.
                </p>
                <div className="mt-6 flex items-center justify-center gap-4">
                    <Button variant="outline" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                    <Button asChild>
                        <Link to="/">Go to Home</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default UnauthorizedPage;
