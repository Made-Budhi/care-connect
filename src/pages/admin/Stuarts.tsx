"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MoreHorizontal, Trash2} from "lucide-react";
import {DataTableStuart} from "@/components/data-table-stuart.tsx";
import PageTitle from "@/components/page-title.tsx";
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
import {supabase} from "@/lib/supabaseClient.ts";
import {toast} from "sonner";

const title = "Stuart User Management";
const breadcrumbs = [
    { name: "Stuarts" }
];

// Interface for the user data we expect from the API
interface StuartUser {
    id: string;
    name: string;
    email: string;
}

function Stuarts() {
    const [data, setData] = useState<StuartUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch only users with the 'stuart' role
            const {data, error } = await supabase.from('profiles').select('*').eq('role', 'stuart');

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

    useEffect(() => {
        fetchUsers();
    }, [axiosPrivate]);

    const handleDelete = async (userId: string) => {
        setLoading(true);
        try {
            // Change selected user's role to 'user'
            const { error: functionError } = await supabase.functions.invoke('update-user-role', {
                // The 'body' is what becomes req.json() inside your Edge Function
                body: {
                    userId: userId,
                    newRole: 'sponsor'
                },
            });

            if (functionError) throw functionError;

            await supabase.from('profiles').update({
                role: 'sponsor'
            }).eq('id', userId);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.message);
        }
        setLoading(false);
    };

    // Defining the columns for the data table
    const columns: ColumnDef<StuartUser>[] = [
        {
            id: "index",
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="text-center">
                        <AlertDialog>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete Account</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will not remove the user. However, <span className="font-semibold">{user.name}</span> will be changed to a sponsor.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user.id)} className={"bg-red-600"}>
                                        Continue
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                );
            },
        }
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <p className="text-center text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <DataTableStuart columns={columns} data={data} />
        </div>
    );
}

export default Stuarts;
