"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Eye } from "lucide-react";
import { DataTableAchievement } from "@/components/data-table-achievement.tsx"; // Assuming a generic DataTable component
import PageTitle from "@/components/page-title.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import {dateTimeFormat} from "@/lib/utils.ts";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const title = "Payment Proof List";
const breadcrumbs = [
    {
        name: "Payment List",
    }
];

// Interface for the data returned by the list endpoint
interface PaymentProofListItem {
    paymentProofUuid: string;
    submissionUuid: string;
    childrenUuid: string | null;
    paymentStatus: 'pending' | 'approved' | 'rejected';
    dateUploaded: string;
    imagePath: string;
}

// Defining the columns for the payment proofs data table
const columns: ColumnDef<PaymentProofListItem>[] = [
    {
        id: "index",
        accessorKey: "index",
        header: () => <div className={"text-center"}>#</div>,
        cell: ({row}) => <div className={"text-center"}>{row.index + 1}</div>
    },
    {
        accessorKey: "paymentStatus",
        header: () => <div className={"text-center"}>Status</div>,
        cell: ({ row }) => {
            const status = row.getValue("paymentStatus") as string;
            const variant = {
                pending: "secondary",
                approved: "approved",
                rejected: "destructive",
            }[status] as "secondary" | "approved" | "destructive";
            return <div className="text-center"><Badge variant={variant} className="capitalize">{status}</Badge></div>
        }
    },
    {
        accessorKey: "paymentProofUuid",
        header: "Payment UUID",
        cell: ({ row }) => <div className="text-xs">{row.getValue("paymentProofUuid")}</div>
    },
    {
        accessorKey: "dateUploaded",
        header: "Upload Date",
        cell: ({ row }) => {
            const date = row.getValue("dateUploaded") as string;
            return <div>{dateTimeFormat(date)}</div>;
        }
    },
    {
        id: "actions",
        header: () => <div className="text-center">Actions</div>,
        enableHiding: false,
        cell: ({ row }) => {
            const proof = row.original;

            return (
                <div className="text-center">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="View Payment Proof">
                                <Eye className="h-4 w-4 " />
                                <span className="sr-only">View Proof</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                            <DialogHeader>
                                <DialogTitle>Payment Proof</DialogTitle>
                            </DialogHeader>
                            <div className="bg-muted rounded-md mt-4">
                                <img
                                    src={proof.imagePath}
                                    alt={`Payment proof for submission ${proof.submissionUuid}`}
                                    className="rounded-md w-full object-contain"
                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                    {/* Here you could add more actions like approve/reject buttons */}
                </div>
            );
        },
    }
];

function PaymentProofList() {
    const [data, setData] = useState<PaymentProofListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchPaymentProofs = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axiosPrivate.get(`/v1/payment-proofs`);
                if (response.status !== 200) {
                    throw new Error(`API Error: Status code ${response.status}`);
                }
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch payment proofs:", error);
                setError("Failed to load payment proof data.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentProofs();
    }, [axiosPrivate]);

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

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
    );
}

export default PaymentProofList;
