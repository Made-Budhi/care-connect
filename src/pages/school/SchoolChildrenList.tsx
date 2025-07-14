"use client"

import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal} from "lucide-react";
import useAuth from "@/hooks/useAuth.tsx";
import {DataTableChildren} from "@/components/data-table-children.tsx";
import {Link} from "react-router"; // Correct import for Link
import PageTitle from "@/components/page-title.tsx";
import {dateFormat} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {toast} from "sonner";

const title = "Children in My School";
const breadcrumbs = [
    { name: "Child List" },
];

// Updated interface to include picture_url for deletion
interface Child {
    id: string
    date_of_birth: string
    funding_status: "funded" | "not_funded" | "pending_approval"
    grade: string
    gender: "Male" | "Female"
    name: string
    picture_url: string | null
}

const StatusBadge = ({status}: {status: 'funded' | 'not_funded' | 'pending_approval'}) => {
    const variant = {
        funded: "approved", // Using a more appropriate color
        not_funded: "secondary",
        pending_approval: "destructive", // Using a more appropriate color
    }[status] as "secondary" | "approved" | "destructive";

    const displayText = {
        funded: "Funded",
        not_funded: "Not Funded",
        pending_approval: "Pending Approval",
    }[status];

    return <Badge variant={variant} className="capitalize">{displayText}</Badge>;
}

function SchoolChildrenList() {
    const [data, setData] = useState<Child[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { auth } = useAuth();

    // The delete handler function
    const handleDelete = async (childId: string, picturePath: string | null) => {
        try {
            // Step 1: Delete the picture from storage if it exists
            if (picturePath) {
                const { error: storageError } = await supabase.storage
                    .from('children-profile-picture')
                    .remove([picturePath]);

                if (storageError) {
                    throw new Error(`Failed to delete image: ${storageError.message}`);
                }
            }

            // Step 2: Delete the child record from the database
            const { error: dbError } = await supabase
                .from('children')
                .delete()
                .eq('id', childId);

            if (dbError) {
                throw new Error(`Failed to delete child data: ${dbError.message}`);
            }

            // Step 3: Update the UI state to remove the deleted child
            setData(prevData => prevData.filter(child => child.id !== childId));
            toast.success("Child has been deleted successfully.");

        } catch (error) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(message);
        }
    };

    // Define columns inside the component to access handleDelete
    const columns: ColumnDef<Child>[] = [
        {
            id: "index",
            header: () => <div className={"text-center"}>#</div>,
            cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
        },
        {
            accessorKey: "funding_status",
            header: () => <div className={"text-center"}>Funding Status</div>,
            cell: ({row}) => <div className={"text-center"}><StatusBadge status={row.getValue("funding_status")} /></div>,
            filterFn: "equals",
        },
        { accessorKey: "name", header: "Name" },
        { accessorKey: "gender", header: "Gender" },
        {
            accessorKey: "grade",
            header: "Grade",
            cell: ({ row }) => <div>{row.getValue('grade')} Grade</div>
        },
        {
            accessorKey: "date_of_birth",
            header: "Date of Birth",
            cell: ({ row }) => <div>{dateFormat(row.getValue("date_of_birth"))}</div>
        },
        {
            id: "actions",
            header: () => <div className={"text-center"}>Actions</div>,
            enableHiding: false,
            cell: ({row}) => {
                const child = row.original;
                return (
                    <AlertDialog>
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
                                    <Link to={`/school/children/${child.id}`}>View Full Detail</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={`/school/children/${child.id}/edit`}>Edit Child Data</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={`/school/children/${child.id}/achievements`}>View Achievements</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to={`/school/children/${child.id}/report-cards`}>View Report Cards</Link>
                                </DropdownMenuItem>
                                {child.funding_status === 'not_funded' && (
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                            Delete Child
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the child's data,
                                    including their profile picture, from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() => handleDelete(child.id, child.picture_url)}
                                >
                                    Yes, delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                );
            },
        }
    ]

    useEffect(() => {
        if (!auth.uuid) {
            setError("Could not identify your user account. Please try logging in again.");
            setLoading(false);
            return;
        }

        const fetchSchoolAndChildren = async () => {
            setLoading(true);
            setError(null);
            try {
                const {data: schoolData, error: schoolError} = await supabase.from('schools').select('id').eq('manager_id', auth.uuid).single();
                if (schoolError) throw schoolError;
                if (!schoolData) throw new Error("You are not associated with any school.");

                // Updated select query to include picture_url
                const {data: childrenData, error: childrenError} = await supabase.from('children').select(
                    'id, date_of_birth, funding_status, grade, gender, name, picture_url'
                ).eq('school_id', schoolData.id);

                if (childrenError) throw childrenError;

                setData(childrenData as Child[]);

            } catch (error) {
                const message = error instanceof Error ? error.message : "An unknown error occurred.";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolAndChildren();
    }, [auth.uuid]);

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            {loading ? (
                <div className={"h-64 flex justify-center items-center"}><LoadingSpinner /></div>
            ) : error ? (
                <div className={"h-64 flex justify-center items-center"}><p className="text-red-500">{error}</p></div>
            ) : (
                <DataTableChildren columns={columns} data={data} />
            )}
        </div>
    )
}

export default SchoolChildrenList;
