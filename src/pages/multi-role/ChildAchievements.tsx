"use client"

import {useEffect, useState} from "react";
import { useParams, Link } from "react-router";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MoreHorizontal } from "lucide-react";
import { DataTableAchievement } from "@/components/data-table-achievement.tsx";
import PageTitle from "@/components/page-title.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import {dateFormat} from "@/lib/utils.ts";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {toast} from "sonner";

// Interface for the Achievement entity, matching the mock API
interface Achievement {
    achievement_type: "academic" | "non-academic"
    child_id: string
    date_achieved: string
    id: string
    title: string
}

interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildAchievements({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
    const [data, setData] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [childName, setChildName] = useState<string | null>(null);

    // For alert dialog
    const [selectedAchievementId, setSelectedAchievementId] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const { uuid } = useParams<{ uuid: string }>(); // Get the child's UUID from the URL
    const {auth} = useAuth();

    const fetchAchievements = async () => {
        setLoading(true);
        setError(null);

        try {
            const {data, error} = await supabase.from('achievements').select('id, title, achievement_type, date_achieved').eq('child_id', uuid);

            if (error) throw error.message

            setData(data);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true)

        try {
            const { data: achievement, error } = await supabase.from('achievements').select('id, image_url').eq('id', selectedAchievementId).single();

            if (error) throw error.message;

            // Step 1: Delete the image from Supabase Storage if it exists.
            if (achievement.image_url) {
                const { error: storageError } = await supabase
                    .storage
                    .from('children-achievements')
                    .remove([achievement.image_url]);

                if (storageError) {
                    // Log the error but proceed to delete the DB record anyway
                    console.error("Could not delete image from storage:", storageError.message);
                }
            }

            // Step 2: Delete the record from the database.
            const { error: dbError } = await supabase
                .from('achievements')
                .delete()
                .eq('id', selectedAchievementId);

            if (dbError) throw dbError;
            toast.success("Achievement deleted successfully.");


        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.message || "An error occurred while deleting the achievement.");
        } finally {

            // re-fetch the data
            await fetchAchievements()

            setLoading(false)
            setOpenDialog(false)
            setSelectedAchievementId(null)
        }
    };
    
    // Defining the columns for the achievement data table
    const columns: ColumnDef<Achievement>[] = [
        {
            id: "index",
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "achievement_type",
            header: "Achievement Type",
            cell: ({ row }) => {
                const type = row.getValue("achievement_type") as string;
                // Using a badge for better visual distinction
                return (
                    <div className={"flex items-center justify-center"}>
                        <Badge variant={type === 'academic' ? 'default' : 'secondary'} className="capitalize">
                            {type}
                        </Badge>
                    </div>
                );
            },
            filterFn: "equals",
        },
        {
            accessorKey: "date_achieved",
            header: "Date",
            cell: ({ row }) => {
                const date = row.getValue("date_achieved") as string;
                return <div>{dateFormat(date)}</div>;
            }
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {

                const achievement = row.original;

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
                            {/* The link should point to your achievement detail page */}
                            <DropdownMenuItem asChild>
                                <Link to={`/${auth.role}/children/achievements/${achievement.id}`}>View Detail</Link>
                            </DropdownMenuItem>

                            {auth.role === 'school' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/school/children/achievements/${achievement.id}/edit`}>Edit Achievement</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => {
                                        setOpenDialog(true)
                                        setSelectedAchievementId(achievement.id)
                                    }}>
                                        Delete Achievement
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

    useEffect(() => {
        // Ensure we don't run the fetch if the UUID isn't available yet
        if (!uuid) {
            setError("Child UUID is missing from the URL.");
            return;
        }

        // Fetch child's name
        const fetchChildName = async () => {
            try {
                const { data, error } = await supabase.from('children').select('name').eq('id', uuid).single();
                if (error) throw error.message;
                setChildName(data.name);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message || "An error occurred while fetching the child's name.");
            }
        }

        fetchChildName();
        fetchAchievements();
    }, [uuid]); // Dependency array ensures this runs when the component mounts or UUID changes

    return (
        <div className="space-y-8">
            <PageTitle title={`${childName}'s Achievements`} breadcrumbs={breadcrumbs} />

            {loading ? (
                <div className="h-full flex justify-center items-center p-8">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="h-full flex justify-center items-center p-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <DataTableAchievement columns={columns} data={data} />
            )}

            {/*Dialog for delete confirmation*/}
            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the achievement
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
    )
}

export default ChildAchievements;