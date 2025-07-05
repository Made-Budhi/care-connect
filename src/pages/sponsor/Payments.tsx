"use client"

import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {useEffect, useState} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button.tsx";
import { Eye } from "lucide-react";
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
import {DataTablePayment} from "@/components/data-table-payment.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import { supabase } from "@/lib/supabaseClient";

const title = "Payment Proof List";
const breadcrumbs = [
    {
        name: "Payment List",
    }
];

// Interface for the data returned by the list endpoint
interface PaymentProof {
    paymentProofUuid: string;
    submissionUuid: string;
    childrenUuid: string | null;
    status: 'pending' | 'approved' | 'rejected';
    date_uploaded: string;
    imagePath: string;
}

// Defining the columns for the payment proofs data table
const columns: ColumnDef<PaymentProof>[] = [
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
        },
        filterFn: 'equals',
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
                        <DialogContent className="sm:max-w-[625px]" key={proof.paymentProofUuid}>
                            <DialogHeader>
                                <DialogTitle>Payment Proof</DialogTitle>
                            </DialogHeader>
                            <div className="bg-muted rounded-md mt-4">
                                <img
                                    src={proof.imagePath ? proof.imagePath : "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"}
                                    alt={`Payment proof for submission ${proof.submissionUuid}`}
                                    className="rounded-md w-full object-contain"
                                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" }}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            );
        },
    }
];

function PaymentProofList() {
    const [data, setData] = useState<PaymentProof[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {auth} = useAuth();

    useEffect(() => {
        const fetchPaymentProofs = async () => {
            if (!auth.uuid) {
                if (!auth.loading) setLoading(false);
                return;
            }
            setLoading(true);

            try {
                // This query fetches payment proofs, joins the related funding submission,
                // and filters the results to only include submissions made by the current user.
                const { data: proofs, error } = await supabase
                    .from('payment_proofs')
                    .select(`
                        id,
                        status,
                        date_uploaded,
                        funding_submissions ( id )
                    `)
                    .filter('funding_submissions.sponsor_id', 'eq', auth.uuid);

                if (error) throw error.message;

                if (proofs) {
                    setData(proofs as PaymentProof[]);
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentProofs();
    }, [auth.uuid, auth.loading]);

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
                <DataTablePayment columns={columns} data={data} />
            )}
        </div>
    );
}

export default PaymentProofList;
