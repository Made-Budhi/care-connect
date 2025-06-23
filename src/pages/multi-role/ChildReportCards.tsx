"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import {Link, useParams} from "react-router"; // Assuming you use react-router for routing
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MoreHorizontal, FileText } from "lucide-react";
import PageTitle from "@/components/page-title.tsx";
import {DataTableReportCard} from "@/components/data-table-report-card.tsx";
import useAuth from "@/hooks/useAuth.tsx";

// Interface for the Report Card entity, matching the database
interface ReportCard {
    uuid: string;
    academicYear: string;
    grade: string;
    semester: 'odd' | 'even';
    semesterDateStart: string;
    semesterDateEnd: string;
    reportCardFile: string;
    final_grade: string;
}


interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildReportCards({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
    const [data, setData] = useState<ReportCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { uuid } = useParams<{ uuid: string }>();

    const {auth} = useAuth();
    const axiosPrivate = useAxiosPrivate();

    // Defining the columns for the report cards data table
    const columns: ColumnDef<ReportCard>[] = [
        {
            id: "index",
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "academicYear",
            header: "Academic Year",
        },
        {
            accessorKey: "grade",
            header: "Grade",
            filterFn: "equals",
        },
        {
            accessorKey: "semester",
            header: "Semester",
            cell: ({ row }) => {
                const semester = row.getValue("semester") as string;
                return <div className="capitalize">{semester}</div>;
            },
            filterFn: "equals",
        },
        {
            accessorKey: "semesterDateStart",
            header: "Semester Start",
            cell: ({ row }) => {
                const date = new Date(row.getValue("semesterDateStart"));
                const formatted = new Intl.DateTimeFormat("en-GB", {
                    year: "numeric", month: "long", day: "2-digit"
                }).format(date);
                return <div>{formatted}</div>;
            }
        },
        {
            accessorKey: "semesterDateEnd",
            header: "Semester End",
            cell: ({ row }) => {
                const date = new Date(row.getValue("semesterDateEnd"));
                const formatted = new Intl.DateTimeFormat("en-GB", {
                    year: "numeric", month: "long", day: "2-digit"
                }).format(date);
                return <div>{formatted}</div>;
            }
        },
        {
            accessorKey: "final_grade",
            header: () => <div className="text-center">Final Grade</div>,
            cell: ({ row }) => {
                return <div className="text-center font-semibold">{row.getValue("final_grade")}</div>
            }
        },
        {
            id: "actions",
            header: () => <div className="text-center">Actions</div>,
            enableHiding: false,
            cell: ({ row }) => {
                const reportCard = row.original;

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
                            {/* This item uses an <a> tag to open the PDF link in a new tab.
                              This is the standard way to link to a file.
                            */}
                            <DropdownMenuItem asChild>
                                <a href={reportCard.reportCardFile} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    View Report Card
                                </a>
                            </DropdownMenuItem>
                            {auth.role === 'school' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/school/children/report-cards/${reportCard.uuid}/edit`}>Edit Report Card</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600">Delete Report Card</DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }
    ];

    useEffect(() => {
        if (!uuid) {
            setError("Child UUID is missing from the URL.");
            return;
        }

        const fetchReportCards = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosPrivate.get(`/v1/report-cards/children/${uuid}`);
                if (response.status !== 200) {
                    throw new Error(`API Error: Status code ${response.status}`);
                }
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch report cards:", error);
                setError("Failed to load report card data.");
            } finally {
                setLoading(false);
            }
        };

        fetchReportCards();
    }, [uuid, axiosPrivate]);


    return (
        <div className="space-y-8">
            <PageTitle title={"Report Cards"} breadcrumbs={breadcrumbs} />

            {loading ? (
                <div className="h-full flex justify-center items-center p-8">
                    <LoadingSpinner />
                </div>
            ) : error ? (
                <div className="h-full flex justify-center items-center p-8">
                    <p className="text-red-500">{error}</p>
                </div>
            ) : (
                <DataTableReportCard columns={columns} data={data} />
            )}
        </div>
    )
}

export default ChildReportCards;