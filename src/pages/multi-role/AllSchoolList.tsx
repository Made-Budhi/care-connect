"use client"

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
import {supabase} from "@/lib/supabaseClient.ts";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";
import {toast} from "sonner";

const title = "School List";
const breadcrumbs = [
    {
        name: "School List",
    }
];

// Interface for the School entity, matching the mock API
interface School {
    id: string;
    name: string;
    region: string;
    address: string;
    // userUuid, latitude, longitude are also available but not shown in this table
}

function SchoolListPage() {
    const [data, setData] = useState<School[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { auth } = useAuth();

    // For alert dialog
    const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Defining the columns for the school data table
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
                                <Link to={`/${auth.role}/schools/${school.id}`}>View Detail</Link>
                            </DropdownMenuItem>

                            {auth.role === 'admin' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/admin/schools/${school.id}/edit`}>Edit School</Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem className="text-red-600" onClick={() => {
                                        setOpenDialog(true)
                                        setSelectedSchoolId(school.id)
                                    }}>
                                        Delete School
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

    const handleDelete = async () => {
        setLoading(true)

        try {
            const { error: dbError } = await supabase
                .from('schools')
                .update({
                    deleted: true
                })
                .eq('id', selectedSchoolId);

            if (dbError) throw dbError;
            toast.success("School data deleted successfully.");
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.message || "An error occurred while deleting the school data.");
        } finally {

            // re-fetch the data
            await fetchSchools()

            setLoading(false)
            setOpenDialog(false)
            setSelectedSchoolId(null)
        }
    };

    const fetchSchools = async () => {
        setLoading(true);
        setError(null);

        try {
            const {data, error} = await supabase
                .from('schools')
                .select('*')
                .eq('deleted', false); // Only fetch active schools

            if (error) {
                throw error.message;
            }
            setData(data);

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSchools();
    }, []);

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

            {/*Dialog for delete confirmation*/}
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the report card
                            and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete()} className={"bg-red-600"}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default SchoolListPage;
