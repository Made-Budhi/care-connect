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
import {supabase} from "@/lib/supabaseClient.ts";

const title = "Foster Child List"
const breadcrumbs = [
    {
        name: "Foster Child List",
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
    }[]
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
        filterFn: "equals",
    },
    {
        id: "school",
        accessorKey: "schools.name",
        header: "School",
        cell: ({ row }) => {
            const school = row.original.schools?.[0]; // Get the first school in the array
            return <div>{school?.name ?? 'N/A'}</div>;
        }
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
            if (!auth.uuid) {
                if (!auth.loading) setLoading(false);
                return;
            }

            setLoading(true);

            try {
                // This query fetches funding submissions for the current sponsor
                // and includes the data for the matched child and their school.
                const { data: submissions, error } = await supabase
                    .from('funding_submissions')
                    .select(`
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
                    .not('matched_child_id', 'is', null); // Only get submissions with a matched child

                if (error) throw error;

                // Extract the children data from the submissions
                const childrenData = submissions
                    .map(sub => sub.children)
                    .filter((child)=> {
                        return child !== null;
                    }); // Filter out any null children

                setData(childrenData);

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchSponsoredChildren();
    }, [auth.uuid, auth.loading]);

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