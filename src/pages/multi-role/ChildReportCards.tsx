"use client"

import {useEffect, useState} from "react";
import {Link, useParams} from "react-router";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MoreHorizontal, FileText } from "lucide-react";
import PageTitle from "@/components/page-title.tsx";
import {DataTableReportCard} from "@/components/data-table-report-card.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import {dateFormat} from "@/lib/utils.ts";
import {supabase} from "@/lib/supabaseClient.ts";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {toast} from "sonner";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog.tsx";

// Interface for the Report Card entity, matching the database
interface ReportCard {
    academic_year: string
    child_id: string
    created_at: string
    file_path: string
    final_grade: string | null
    grade: string
    id: string
    semester: "odd" | "even"
    semester_date_end: string | null
    semester_date_start: string | null
}


interface Breadcrumbs {
    name?: string;
    url?: string;
}

function ChildReportCards({breadcrumbs}: { breadcrumbs: Breadcrumbs[] }) {
    const [data, setData] = useState<ReportCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [childName, setChildName] = useState<string | null>(null);

    // For alert dialog
    const [selectedReportCardsId, setSelectedReportCardsId] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    // State to manage the PDF viewer dialog
    const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const { uuid } = useParams<{ uuid: string }>();
    const {auth} = useAuth();

    // Function to generate a signed URL and open the dialog
    const handleViewReportCard = async (filePath: string) => {
        try {
            const { data, error } = await supabase
                .storage
                .from('children-report-card') // Your private bucket name
                .createSignedUrl(filePath, 3600); // URL is valid for 5 minutes

            if (error) throw error;

            setPdfUrl(data.signedUrl);
            setIsPdfDialogOpen(true);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.message || "An error occurred while generating the URL.");
        }
    };

    const handleDelete = async () => {
        setLoading(true)

        try {
            const { data: reportCard, error } = await supabase.from('report_cards')
                .select('id, file_path').eq('id', selectedReportCardsId).single();

            if (error) throw error.message;

            // Step 1: Delete the image from Supabase Storage if it exists.
            if (reportCard.file_path) {
                const { error: storageError } = await supabase
                    .storage
                    .from('children-report-card')
                    .remove([reportCard.file_path]);

                if (storageError) {
                    // Log the error but proceed to delete the DB record anyway
                    console.error("Could not delete image from storage:", storageError.message);
                }
            }

            // Step 2: Delete the record from the database.
            const { error: dbError } = await supabase
                .from('report_cards')
                .delete()
                .eq('id', selectedReportCardsId);

            if (dbError) throw dbError;
            toast.success("Report card deleted successfully.");
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error(error.message || "An error occurred while deleting the report card.");
        } finally {

            // re-fetch the data
            await fetchReportCards()

            setLoading(false)
            setOpenDialog(false)
            setSelectedReportCardsId(null)
        }
    };

    // Defining the columns for the report cards data table
    const columns: ColumnDef<ReportCard>[] = [
        {
            id: "index",
            header: () => <div className="text-center">#</div>,
            cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
        },
        {
            accessorKey: "academic_year",
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
            accessorKey: "semester_date_start",
            header: "Semester Start",
            cell: ({ row }) => {
                const date = row.getValue("semester_date_start") as string;
                return <div>{dateFormat(date)}</div>;
            }
        },
        {
            accessorKey: "semester_date_end",
            header: "Semester End",
            cell: ({ row }) => {
                const date = row.getValue("semester_date_end") as string;;
                return <div>{dateFormat(date)}</div>;
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
                            <DropdownMenuItem onClick={() => handleViewReportCard(reportCard.file_path)} className="flex items-center gap-2 cursor-pointer">
                                <FileText className="h-4 w-4" />
                                View Report Card
                            </DropdownMenuItem>
                            {auth.role === 'school' && (
                                <>
                                    <DropdownMenuItem asChild>
                                        <Link to={`/school/children/report-cards/${reportCard.id}/edit`}>Edit Report Card</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => {
                                        setOpenDialog(true)
                                        setSelectedReportCardsId(reportCard.id)
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

    // Fetch the child's name from the database
    const fetchChildName = async () => {
        try {
            const {data, error} = await supabase.from('children').select('name').eq('id', uuid).single();
            if (error) throw error;
            setChildName(data.name);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message || "An error occurred while fetching the child's name.");
        }
    }

    const fetchReportCards = async () => {
        try {
            const {data, error} = await supabase.from('report_cards').select('*').eq('child_id', uuid);

            if (error) throw error;

            setData(data);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message || "An error occurred while fetching the report cards.");
        }
    };

    useEffect(() => {
        setLoading(true);
            fetchChildName()
            fetchReportCards();
        setLoading(false);
    }, [uuid]);


    return (
        <div className="space-y-8">
            <PageTitle title={`${childName}'s Report Cards`} breadcrumbs={breadcrumbs} />

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

            {/* PDF Viewer Dialog */}
            <Dialog open={isPdfDialogOpen} onOpenChange={setIsPdfDialogOpen}>
                <DialogContent className="sm:max-w-[80vw] h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>Report Card Viewer</DialogTitle>
                    </DialogHeader>

                    <div className="flex-grow">
                        {pdfUrl ? (
                            <iframe src={pdfUrl} className="w-full h-full rounded-md" title="Report Card PDF"/>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <LoadingSpinner />
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

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
    )
}

export default ChildReportCards;