"use client"

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
import {Badge} from "@/components/ui/badge.tsx";
import type {Json} from "../../../database.types.ts";
import {supabase} from "@/lib/supabaseClient.ts";

const title = "Foster Child List"
const breadcrumbs = [
    {
        name: "Foster Child List",
    },
]

interface Child {
    created_at: string
    date_of_birth: string
    dreams: string | null
    father_job: string | null
    father_name: string | null
    favorite_subjects: string[] | null
    funding_status: "funded" | "not_funded" | "pending_approval"
    gender: "Male" | "Female"
    id: string
    mother_name: string | null
    name: string
    picture_url: string | null
    school_id: string | null
    semester: "even" | "odd"
    shirt_size: string | null
    shoes_size: string | null
    siblings: Json | null
}

const StatusBadge = ({status}: {status: "funded" | "not_funded" | "pending_approval"}) => {
    const variant = {
        funded: "approved",
        not_funded: "secondary",
        pending_approval: "pending",
    }[status] as "secondary" | "approved" | "pending";

    const displayText = {
        funded: "Funded",
        not_funded: "Not Funded",
        pending_approval: "Pending Approval",
    }[status]

    return <Badge variant={variant}>{displayText}</Badge>;
}


function AllChildrenList() {
    const [data, setData] = useState<Child[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth();

    const columns: ColumnDef<Child>[] = [
        {
            id: "index",
            accessorKey: "index",
            header: () => <div className={"text-center"}>#</div>,
            cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
        },
        {
            id: "funding_status",
            accessorKey: "funding_status",
            header: () => <div className={"text-center"}>Status</div>,
            cell: ({row}) => <div className={"text-center"}><StatusBadge status={row.getValue("funding_status")} /></div>,
            filterFn: "equals",
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Name",
        },
        {
            id: "gender",
            accessorKey: "gender",
            header: "Gender",
            filterFn: "equals",
        },
        {
            id: "school",
            accessorKey: "school_id.name",
            header: "School",
        },
        {
            id: "grade",
            accessorKey: "grade",
            header: "Grade",
            filterFn: "equals",
        },
        {
            id: "date_of_birth",
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
                                <Link to={`/${auth.role}/children/${children.id}`}>View Detail</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/${auth.role}/children/${children.id}/achievements`}>View Achievement</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link to={`/${auth.role}/children/${children.id}/report-cards`}>View Report Card</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ]

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);

            try {
                const {data, error} = await supabase.from('children').select(
                    "id, funding_status, gender, name, date_of_birth, grade, school_id (name)"
                );

                if (error) throw error;

                setData(data);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchChildren()
    }, [auth.uuid]);

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>

            {data && <DataTableChildren columns={columns} data={data} />}

            {loading && <div className={"h-full flex justify-center"}><LoadingSpinner /></div>}
            {!loading && error && <div className={"h-full flex justify-center"}><p>{error}</p></div>}
        </div>
    )
}

export default AllChildrenList;