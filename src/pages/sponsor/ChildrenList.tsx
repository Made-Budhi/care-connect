"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
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

const title = "Foster Child List"
const breadcrumbs = [
    {
        name: "Foster Child List",
    },
]

interface Child {
    uuid: string;
    index: string;
    name: string;
    gender: string;
    school: string;
    grade: string;
    birthdate: string;
}

const columns: ColumnDef<Child>[] = [
    {
        id: "index",
        accessorKey: "index",
        header: () => <div className={"text-center"}>#</div>,
        cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
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
    },
    {
        id: "school",
        accessorKey: "schoolName",
        header: "School",
    },
    {
        id: "grade",
        accessorKey: "grade",
        header: "Grade",
    },
    {
        id: "birthdate",
        accessorKey: "dateOfBirth",
        header: "Date of Birth",
        cell: ({ row }) => {
            const date = row.getValue("birthdate") as string;
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
                            <Link to={`/sponsor/children/view/${children.uuid}`}>View Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/sponsor/children/${children.uuid}/achievements`}>View Achievement</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={`/sponsor/children/${children.uuid}/report-cards`}>View Report Card</Link>
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

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);

            try {
                const response = await axiosPrivate.get(`/v1/sponsor/${auth.uuid}/children`);
                if (!(response.status === 200)) throw new Error(`API Error: ${response.status}`);
                setData(response.data);
            } catch (error) {
                console.error(error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChildren()
    }, [axiosPrivate, auth.uuid]);

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs}></PageTitle>

            {data && <DataTableChildren columns={columns} data={data} />}

            {loading && <div className={"h-full flex justify-center"}><LoadingSpinner /></div>}
            {!loading && error && <div className={"h-full flex justify-center"}><p>{error}</p></div>}
        </div>
    )
}

export default ChildrenList;