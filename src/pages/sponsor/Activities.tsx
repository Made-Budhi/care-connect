"use client"

import {useEffect, useState} from "react";
// import {Link} from "react-router";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {type ColumnDef} from "@tanstack/react-table";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu.tsx";
// import {Button} from "@/components/ui/button.tsx";
// import {MoreHorizontal} from "lucide-react";
import PageTitle from "@/components/page-title.tsx";
import {Badge} from "@/components/ui/badge.tsx";
import {dateTimeFormat} from "@/lib/utils.ts";
import useAuth from "@/hooks/useAuth.tsx";
import {DataTableActivity} from "@/components/data-table-activity.tsx";
import {supabase} from "@/lib/supabaseClient.ts";

const title = "My Activity Submissions";
const breadcrumbs = [
    {
        name: "Activity List",
    },
];

// This interface should match the data returned by the API endpoint
// GET /v1/event-submissions/sponsor/:sponsorUuid
interface EventSubmission {
    id: string;
    title: string;
    child_id: {
        name: string;
        school_id: {
            name: string;
        }
    };
    status: 'pending' | 'approved' | 'rejected';
    event_start_time: string;
    event_end_time: string;
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
        accessorKey: "child_id.name",
        header: "Child",
    },
    {
        accessorKey: "child_id.school_id.name",
        header: "School",
    },
    {
        accessorKey: "event_start_time",
        header: "Event Date",
        cell: ({ row }) => {
            const date = row.getValue("event_start_time") as string;
            return <div>{dateTimeFormat(date)}</div>;
        }
    },
    // {
    //     id: "actions",
    //     header: () => <div className="text-center">Actions</div>,
    //     enableHiding: false,
    //     cell: ({row}) => {
    //         const submission = row.original;
    //
    //         const detailUrl = `/sponsor/activities/${submission.id}`;
    //
    //         return (
    //             <DropdownMenu>
    //                 <div className="flex justify-center items-center">
    //                     <DropdownMenuTrigger asChild>
    //                         <Button variant="ghost" className="h-8 w-8 p-0">
    //                             <span className="sr-only">Open menu</span>
    //                             <MoreHorizontal className="h-4 w-4" />
    //                         </Button>
    //                     </DropdownMenuTrigger>
    //                 </div>
    //                 <DropdownMenuContent align="end">
    //                     <DropdownMenuItem asChild>
    //                         <Link to={detailUrl}>View Detail</Link>
    //                     </DropdownMenuItem>
    //                     {/* You could add an "Edit Submission" link if it's pending */}
    //                     {submission.status === 'pending' && (
    //                         <DropdownMenuItem asChild>
    //                             <Link to={`/sponsor/event-submissions/edit/${submission.id}`}>Edit Submission</Link>
    //                         </DropdownMenuItem>
    //                     )}
    //                 </DropdownMenuContent>
    //             </DropdownMenu>
    //         );
    //     },
    // }
];


function EventSubmissionList() {
    const [data, setData] = useState<EventSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth(); // Get the authentication context

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
                const {
                    data,
                    error
                } = await supabase.from('activities').select('*, child_id (name, school_id (name))').eq('sponsor_id', sponsorUuid);

                if (error) throw error

                setData(data);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [auth]); // Rerun effect if auth context changes

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs}/>

            {loading ? (
                <div className="h-full flex justify-center items-center p-8">
                    <LoadingSpinner/>
                </div>
            ) : error ? (
                <div className="h-full flex justify-center items-center p-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                // Assuming you have a reusable DataTable component
                <DataTableActivity columns={columns} data={data}/>
            )}
        </div>
    );
}

export default EventSubmissionList;