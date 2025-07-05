import type {ColumnDef} from "@tanstack/react-table";
import {Badge} from "@/components/ui/badge.tsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import {useEffect, useState} from "react";
import useAuth from "@/hooks/useAuth.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {DataTableFunding} from "@/components/data-table-funding.tsx";
import PageTitle from "@/components/page-title.tsx";
import {Link} from "react-router";
import {dateTimeFormat} from "@/lib/utils.ts";
import {supabase} from "@/lib/supabaseClient.ts";

const PENDING = "pending";
const APPROVED = "approved";
const REJECTED = "rejected";

const title = "Funding Submissions"
const breadcrumbs = [
    {
        name: "Funding Submissions",
    },
]

interface FundingSubmission {
    id: string;
    status: "pending" | "approved" | "rejected";
    period: number;
    date_requested: string;
}

const columns: ColumnDef<FundingSubmission>[] = [
    {
        id: "index",
        accessorKey: "index",
        header: () => <div className={"text-center"}>#</div>,
        cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
    },
    {
        id: "status",
        accessorKey: "status",
        header: () => <div className={"text-center"}>Status</div>,
        cell: ({row}) => {
            const status: string = row.getValue("status");

            const badgeVariant: "approved" | "secondary" | "destructive" | "default" | "outline" | null | undefined =
                status === PENDING ? "secondary" :
                status === APPROVED ? "approved" :
                status === REJECTED ? "destructive" :
                "default"; // fallback value

            return (
                <div className={"text-center"}>
                    <Badge variant={badgeVariant} className={"capitalize"}>{status}</Badge>
                </div>
            )
        },
        filterFn: "equals",
    },
    {
        id: "period",
        accessorKey: "period",
        header: "Period",
        cell: ({row}) => {
            return <p>{row.getValue("period")} Year</p>
        }
    },
    {
        id: "date_requested",
        accessorKey: "date_requested",
        header: "Date Requested",
        cell: ({ row }) => {
            const date = row.getValue("date_requested") as string
            return <div>{dateTimeFormat(date)}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className={"text-center"}>Actions</div>,
        enableHiding: false,
        cell: ({row}) => {
            const fundingSubmission = row.original;

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
                            <Link to={`/sponsor/funding/view/${fundingSubmission.id}`}>
                                View Detail
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    }
]

function FundingSubmissions() {
    const [data, setData] = useState<FundingSubmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth();

    useEffect(() => {
        const fetchFundingSubmissions = async () => {
            if (!auth.uuid) return; // Don't fetch if the user is not logged in

            setLoading(true);

            try {
                // Use the Supabase client to query the 'funding_submissions' table
                const { data: submissions, error } = await supabase
                    .from('funding_submissions')
                    // Select the specific columns needed for the list view
                    .select('id, status, period, date_requested')
                    // Filter the results to only show submissions by the current user
                    .eq('sponsor_id', auth.uuid)
                    // Order by the most recently requested
                    .order('date_requested', { ascending: false });

                if (error) throw error.message;

                if (submissions) {
                    setData(submissions);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchFundingSubmissions();
    }, [auth.uuid]);

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>

            {data && <DataTableFunding columns={columns} data={data} />}

            {loading && <div className={"h-full flex justify-center"}><LoadingSpinner /></div>}
            {!loading && error && <div className={"h-full flex justify-center"}><p>{error}</p></div>}

        </div>
    )
}

export default FundingSubmissions;