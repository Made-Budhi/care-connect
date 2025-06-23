"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import { useParams, Link } from "react-router"; // Make sure to have react-router installed
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MoreHorizontal } from "lucide-react";
import { DataTableAchievement } from "@/components/data-table-achievement.tsx"; // Assuming a generic DataTable component exists
import PageTitle from "@/components/page-title.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import useAuth from "@/hooks/useAuth.tsx";

// Interface for the Achievement entity, matching the mock API
interface Achievement {
    uuid: string;
    title: string;
    description: string;
    achievementType: 'academic' | 'non-academic';
    image: string;
    date: string;
}

interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildAchievements({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
    const [data, setData] = useState<Achievement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { uuid } = useParams<{ uuid: string }>(); // Get the child's UUID from the URL
    const {auth} = useAuth();

    const axiosPrivate = useAxiosPrivate();

    // Defining the columns for the achievements data table
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
            accessorKey: "achievementType",
            header: "Achievement Type",
            cell: ({ row }) => {
                const type = row.getValue("achievementType") as string;
                // Using a badge for better visual distinction
                return (
                    <Badge variant={type === 'academic' ? 'default' : 'secondary'} className="capitalize">
                        {type}
                    </Badge>
                );
            },
            filterFn: "equals",
        },
        {
            accessorKey: "date",
            header: "Date",
            cell: ({ row }) => {
                const date = new Date(row.getValue("date"));
                // Formatting the date for readability
                const formatted = new Intl.DateTimeFormat("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit"
                }).format(date);

                return <div>{formatted}</div>;
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
                                <Link to={`/${auth.role}/children/achievements/${achievement.uuid}`}>View Detail</Link>
                            </DropdownMenuItem>

                            {auth.role === 'school' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/school/children/achievements/${achievement.uuid}`}>View Detail</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/school/children/achievements/${achievement.uuid}/edit`}>Edit Achievement</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Delete Achievement</DropdownMenuItem>
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

        const fetchAchievements = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosPrivate.get(`/v1/achievements/children/${uuid}`);
                if (response.status !== 200) {
                    throw new Error(`API Error: Status code ${response.status}`);
                }
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch achievements:", error);
                setError("Failed to load achievement data.");
            } finally {
                setLoading(false);
            }
        };

        fetchAchievements();
    }, [uuid, axiosPrivate]); // Dependency array ensures this runs when the component mounts or UUID changes

    return (
        <div className="space-y-8">
            <PageTitle title={"Achievements"} breadcrumbs={breadcrumbs} />

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
        </div>
    )
}

export default ChildAchievements;