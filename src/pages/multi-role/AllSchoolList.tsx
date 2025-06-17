"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import { Link } from "react-router";
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
import {DataTableSchool} from "@/components/data-table-school.tsx"; // Assuming a generic DataTable component
import PageTitle from "@/components/page-title.tsx";
import useAuth from "@/hooks/useAuth.tsx";

const title = "School List";
const breadcrumbs = [
    {
        name: "School List",
    }
];

// Interface for the School entity, matching the mock API
interface School {
    uuid: string;
    name: string;
    region: string;
    address: string;
    // userUuid, latitude, longitude are also available but not shown in this table
}



function SchoolListPage() {
    const [data, setData] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();
    const { auth } = useAuth();

    // Defining the columns for the schools data table
    const columns: ColumnDef<School>[] = [
        {
            id: "index",
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            header: "School Name",
        },
        {
            accessorKey: "region",
            header: "Region",
        },
        {
            accessorKey: "address",
            header: "Address",
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const school = row.original;

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
                                <Link to={`/${auth.role}/schools/${school.uuid}`}>View Detail</Link>
                            </DropdownMenuItem>

                            {auth.role === 'admin' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/admin/schools/${school.uuid}/edit`}>Edit School</Link>
                                    </DropdownMenuItem>
                                    {/* You could add a delete action here with a confirmation dialog */}
                                    <DropdownMenuItem className="text-red-600">Delete School</DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

    useEffect(() => {
        const fetchSchools = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosPrivate.get(`/v1/schools`);
                if (response.status !== 200) {
                    throw new Error(`API Error: Status code ${response.status}`);
                }
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch schools:", error);
                setError("Failed to load school data.");
            } finally {
                setLoading(false);
            }
        };

        fetchSchools();
    }, [axiosPrivate]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
            </div>

            {loading ? (
                <div className="h-full flex justify-center items-center p-8">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="h-full flex justify-center items-center p-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <DataTableSchool columns={columns} data={data} />
            )}
        </div>
    );
}

export default SchoolListPage;
