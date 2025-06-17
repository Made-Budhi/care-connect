"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import useAuth from "@/hooks/useAuth.tsx";
import {DataTableChildren} from "@/components/data-table-children.tsx"; // Using a generic DataTable
import {Link} from "react-router";
import PageTitle from "@/components/page-title.tsx";
import {dateFormat} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";

const title = "Children in My School";
const breadcrumbs = [
    { name: "Child List" },
];

// This interface matches the data returned by the /v1/schools/:uuid/children endpoint
interface Child {
    uuid: string;
    status: 'funded' | 'not_funded' | 'pending_approval';
    name: string;
    gender: string;
    grade: string;
    dateOfBirth: string;
}

// Reusable StatusBadge component from your example
const StatusBadge = ({status}: {status: 'funded' | 'not_funded' | 'pending_approval'}) => {
    const variant = {
        funded: "approved",
        not_funded: "secondary",
        pending_approval: "pending",
    }[status] as "secondary" | "approved" | "pending";

    const displayText = {
        funded: "Funded",
        not_funded: "Not Funded",
        pending_approval: "Pending Approval",
    }[status];

    return <Badge variant={variant} className="capitalize">{displayText}</Badge>;
}

// Defining the columns for the children data table, tailored for a school admin's view
const columns: ColumnDef<Child>[] = [
    {
        id: "index",
        header: () => <div className={"text-center"}>#</div>,
        cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
    },
    {
        accessorKey: "status",
        header: () => <div className={"text-center"}>Funding Status</div>,
        cell: ({row}) => <div className={"text-center"}><StatusBadge status={row.getValue("status")} /></div>
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "gender",
        header: "Gender",
    },
    {
        accessorKey: "grade",
        header: "Grade",
    },
    {
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => {
            const date = row.getValue("dateOfBirth") as string;
            return <div>{dateFormat(date)}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className={"text-center"}>Actions</div>,
        enableHiding: false,
        cell: ({row}) => {
            const child = row.original;
            // A school admin might view a more generic child detail page
            return (
                <DropdownMenu>
                    <div className={"flex justify-center items-center"}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal/>
                            </Button>
                        </DropdownMenuTrigger>
                    </div>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={`/school/children/${child.uuid}`}>View Full Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/school/children/${child.uuid}/edit`}>Edit Child Data</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/school/children/${child.uuid}/achievements`}>View Achievements</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/school/children/${child.uuid}/report-cards`}>View Report Cards</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
]

function SchoolChildrenList() {
    const [data, setData] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { auth } = useAuth(); // Using the auth context

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        // Assume the auth context for a school user has their own UUID
        const userUuid = auth?.uuid;

        if (!userUuid) {
            setError("Could not identify your user account. Please try logging in again.");
            setLoading(false);
            return;
        }

        const fetchSchoolAndChildren = async () => {
            setLoading(true);
            setError(null);
            try {
                // Step 1: Fetch the school associated with the logged-in user
                const schoolResponse = await axiosPrivate.get(`/v1/schools/user/${userUuid}`);
                const schoolUuid = schoolResponse.data.uuid;

                if (!schoolUuid) {
                    throw new Error("No school is associated with your account.");
                }

                // Step 2: Use the fetched schoolUuid to get the children
                const childrenResponse = await axiosPrivate.get(`/v1/schools/${schoolUuid}/children`);
                if (childrenResponse.status !== 200) {
                    throw new Error(`API Error: ${childrenResponse.status}`);
                }
                setData(childrenResponse.data);

            } catch (error) {
                console.error(error);
                // Provide a more specific error message if possible
                // const errorMessage = error.response?.data?.message || "Failed to load children's data.";
                setError("Failed to load children's data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolAndChildren();
    }, [axiosPrivate, auth]); // Rerun the effect if the auth context changes

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            {loading ? (
                <div className={"h-64 flex justify-center items-center"}><LoadingSpinner /></div>
            ) : error ? (
                <div className={"h-64 flex justify-center items-center"}><p className="text-red-500">{error}</p></div>
            ) : (
                <DataTableChildren columns={columns} data={data} />
            )}
        </div>
    )
}

export default SchoolChildrenList;
