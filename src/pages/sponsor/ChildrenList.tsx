"use client"

// import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {
    type ColumnDef,
} from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import useAuth from "@/hooks/useAuth.tsx";
import {DataTableChildren} from "@/components/data-table-children.tsx";
import {Link} from "react-router";
import PageTitle from "@/components/page-title.tsx";
import {dateFormat} from "@/lib/utils.ts";
// import {Badge} from "@/components/ui/badge.tsx";
import {supabase} from "@/lib/supabaseClient.ts";

const title = "My Sponsored Children";
const breadcrumbs = [
    {
        name: "My Children",
    },
]

interface Child {
    id: string;
    name: string;
    gender: string;
    grade: string;
    date_of_birth: string;
    schools: {
        name: string;
    } | null
}

const columns: ColumnDef<Child>[] = [
    {
        id: "index",
        header: () => <div className={"text-center"}>#</div>,
        cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "gender",
        header: "Gender",
        filterFn: "equals",
    },
    {
        accessorKey: "schools.name",
        header: "School",
        cell: ({ row }) => {
            const schoolName = row.original.schools?.name;
            return <div>{schoolName ?? 'N/A'}</div>;
        }
    },
    {
        accessorKey: "grade",
        header: "Grade",
        filterFn: "equals",
    },
    {
        accessorKey: "date_of_birth",
        header: "Date of Birth",
        cell: ({ row }) => {
            const date = row.getValue("date_of_birth") as string;
            return <div>{dateFormat(date)}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className={"text-center"}>Actions</div>,
        enableHiding: false,
        cell: ({row}) => {
            const children = row.original

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
                            <Link to={`/sponsor/children/view/${children.id}`}>View Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/sponsor/children/${children.id}/achievements`}>View Achievement</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/sponsor/children/${children.id}/report-cards`}>View Report Card</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
]

function ChildrenList() {
    const [data, setData] = useState<Child[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth();

    useEffect(() => {
        const fetchSponsoredChildren = async () => {
            if (!auth?.uuid) {
                if (!auth?.loading) setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // --- REFACTORED: Fetching Logic ---
                // 1. Fetch submissions including the start and end dates.
                const { data: submissions, error } = await supabase
                    .from('funding_submissions')
                    .select(`
                        start_date,
                        end_date,
                        children:matched_child_id (
                            id,
                            name,
                            gender,
                            grade,
                            date_of_birth,
                            schools ( name )
                        )
                    `)
                    .eq('sponsor_id', auth.uuid)
                    .not('matched_child_id', 'is', null)
                    .eq('status', 'approved');

                if (error) throw error;

                // 2. Filter on the client-side using the explicit dates.
                const today = new Date();
                const activeChildren = submissions
                    .filter(sub => {
                        // Ensure we have the necessary data to perform the check
                        if (!sub.children || !sub.start_date || !sub.end_date) {
                            return false;
                        }

                        const startDate = new Date(sub.start_date);
                        const endDate = new Date(sub.end_date);

                        // The sponsorship is active if today is between the start and end dates.
                        return startDate <= today && today <= endDate;
                    })
                    .map(sub => sub.children); // Extract just the child data

                setData(activeChildren as Child[]);

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message || "An error occurred while fetching your sponsored children.");
            } finally {
                setLoading(false);
            }
        };

        fetchSponsoredChildren();
    }, [auth?.uuid, auth?.loading]);

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>

            {loading ? (
                <div className={"h-full flex justify-center"}><LoadingSpinner /></div>
            ) : error ? (
                <div className={"h-full flex justify-center"}><p className="text-red-500">{error}</p></div>
            ) : (
                <DataTableChildren columns={columns} data={data} />
            )}
        </div>
    )
}

export default ChildrenList;
