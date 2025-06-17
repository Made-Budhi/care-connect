"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import {Link} from "react-router";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {type ColumnDef} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import PageTitle from "@/components/page-title.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {dateTimeFormat} from "@/lib/utils.ts";
import useAuth from "@/hooks/useAuth.tsx";
import {DataTableActivity} from "@/components/data-table-activity.tsx";

const title = "My Activity Submissions";
const breadcrumbs = [
    {
        name: "Activity List",
    },
];

// This interface should match the data returned by the API endpoint
// GET /v1/event-submissions/sponsor/:sponsorUuid
interface EventSubmission {
    uuid: string;
    title: string;
    childName: string;
    schoolName: string;
    status: 'pending' | 'approved' | 'rejected';
    eventStart: string;
    eventEnd: string;
}

// Defining the columns for the event submissions data table
const columns: ColumnDef<EventSubmission>[] = [
    {
        id: "index",
        header: () => <div className="text-center">#</div>,
        cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
    },
    {
        accessorKey: "status",
        header: () => <div className={"text-center"}>Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("status") as 'pending' | 'approved' | 'rejected';
            const variant = {
                pending: "secondary",
                approved: "approved",
                rejected: "destructive",
            }[status] as "secondary" | "approved" | "destructive";
            return <div className="text-center"><Badge variant={variant} className="capitalize">{status}</Badge></div>
        }
    },
    {
        accessorKey: "title",
        header: "Event Title",
    },
    {
        accessorKey: "childName",
        header: "Child",
    },
    {
        accessorKey: "schoolName",
        header: "School",
    },
    {
        accessorKey: "eventStart",
        header: "Event Date",
        cell: ({ row }) => {
            const date = row.getValue("eventStart") as string;
            return <div>{dateTimeFormat(date)}</div>;
        }
    },
    {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        enableHiding: false,
        cell: ({row}) => {
            const submission = row.original;

            const detailUrl = `/sponsor/activities/${submission.uuid}`;

            return (
                <DropdownMenu>
                    <div className="flex justify-center items-center">
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                    </div>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link to={detailUrl}>View Detail</Link>
                        </DropdownMenuItem>
                        {/* You could add an "Edit Submission" link if it's pending */}
                        {submission.status === 'pending' && (
                            <DropdownMenuItem asChild>
                                <Link to={`/sponsor/event-submissions/edit/${submission.uuid}`}>Edit Submission</Link>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
];


function EventSubmissionList() {
    const [data, setData] = useState<EventSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { auth } = useAuth(); // Get the authentication context

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        // We need the sponsor's UUID from the auth context to fetch their submissions
        const sponsorUuid = auth?.uuid;

        if (!sponsorUuid) {
            setError("Sponsor information not found. Please log in again.");
            return;
        }

        const fetchSubmissions = async () => {
            setLoading(true);
            setError(null);

            try {
                // Use the sponsor's UUID in the API endpoint
                const response = await axiosPrivate.get(`/v1/event-submissions/sponsor/${sponsorUuid}`);
                if (response.status !== 200) {
                    throw new Error(`API Error: Status code ${response.status}`);
                }
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch event submissions:", error);
                setError("Failed to load your event submissions.");
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [auth, axiosPrivate]); // Rerun effect if auth context changes

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            {loading ? (
                <div className="h-full flex justify-center items-center p-8">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="h-full flex justify-center items-center p-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                // Assuming you have a reusable DataTable component
                <DataTableActivity columns={columns} data={data} />
            )}
        </div>
    );
}

export default EventSubmissionList;
