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
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {DataTableFunding} from "@/components/data-table-funding.tsx";
import PageTitle from "@/components/page-title.tsx";

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
    uuid: string;
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
                    <Badge variant={badgeVariant}>{status}</Badge>
                </div>
            )
        }
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
            const date = new Date(row.getValue("date_requested"))
            const formatted = new Intl.DateTimeFormat("en-UK", {
                year: "numeric",
                month: "long",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }).format(date)

            return <div>{formatted}</div>
        }
    },
    {
        id: "actions",
        header: () => <div className={"text-center"}>Actions</div>,
        enableHiding: false,
        cell: () => {
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
                        <DropdownMenuItem>View Detail</DropdownMenuItem>
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

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchFundingSubmissions = async () => {
            setLoading(true);

            try {
                const response = await axiosPrivate.get(`/v1/funding-submissions/sponsor/${auth.uuid}`);
                console.log("Funding Submissions: " + response.data);
                setData(response.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchFundingSubmissions()
    }, []);

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