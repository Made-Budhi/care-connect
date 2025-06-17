"use client"

import { useEffect, useState } from "react";
import { Link } from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import PageTitle from "@/components/page-title.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Eye } from "lucide-react";

const title = "Payment Proof Approval";
const breadcrumbs = [
    { name: "Dashboard", url: "/admin/dashboard" },
    { name: "Payment Proofs" },
];

// This interface matches the data from the /v1/payment-proofs endpoint
interface PaymentProofListItem {
    paymentProofUuid: string;
    submissionUuid: string;
    childrenUuid: string | null;
    paymentStatus: 'pending' | 'approved' | 'rejected';
    dateUploaded: string;
    imagePath: string;
}

function PaymentProofApprovalPage() {
    const [proofs, setProofs] = useState<PaymentProofListItem[]>([]);
    const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        const fetchPaymentProofs = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get("/v1/payment-proofs");
                const data: PaymentProofListItem[] = response.data;
                setProofs(data);

                // Calculate counts after fetching
                const pendingCount = data.filter(p => p.paymentStatus === 'pending').length;
                const approvedCount = data.filter(p => p.paymentStatus === 'approved').length;
                const rejectedCount = data.filter(p => p.paymentStatus === 'rejected').length;
                setCounts({ pending: pendingCount, approved: approvedCount, rejected: rejectedCount });

            } catch (err) {
                console.error("Failed to fetch payment proofs", err);
                setError("Failed to load payment proofs. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPaymentProofs();
    }, [axiosPrivate]);

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
        const variant = {
            pending: "secondary",
            approved: "approved",
            rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive";
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const PaymentProofCard = ({ proof }: { proof: PaymentProofListItem }) => (
        <div key={proof.paymentProofUuid} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-4">
                <StatusBadge status={proof.paymentStatus} />
                <div className="space-y-1">
                    <p className="font-semibold text-base">Submission: {proof.submissionUuid}</p>
                    <p className="text-xs text-muted-foreground">
                        Uploaded on {dateTimeFormat(proof.dateUploaded)}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" title="View Payment Proof">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Proof</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px]">
                        <DialogHeader>
                            <DialogTitle>Payment Proof Image</DialogTitle>
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
                <Button asChild variant="outline" size="sm">
                    {/* This button links to the original funding submission for context */}
                    <Link to={`/stuart/funding/${proof.submissionUuid}`}>
                        View Submission
                    </Link>
                </Button>
            </div>
        </div>
    );

    const StatisticCard = ({ title, count }: { title: string, count: number }) => (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold md:text-4xl">{count}</div>
            </CardContent>
        </Card>
    );

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
        );
    }

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            <div className="grid gap-3 sm:grid-cols-3">
                <StatisticCard title={"Pending"} count={counts.pending} />
                <StatisticCard title={"Approved"} count={counts.approved} />
                <StatisticCard title={"Rejected"} count={counts.rejected} />
            </div>

            <Card>
                <CardContent className="pt-6">
                    <Tabs defaultValue="all">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="space-y-4 mt-4">
                            {proofs.length > 0 ? proofs.map((proof) => (
                                <PaymentProofCard key={proof.paymentProofUuid} proof={proof} />
                            )) : (
                                <p className="text-center text-muted-foreground py-8">No payment proofs found.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="pending" className="space-y-4 mt-4">
                            {counts.pending > 0 ? proofs
                                .filter(proof => proof.paymentStatus === "pending")
                                .map((proof) => (
                                    <PaymentProofCard key={proof.paymentProofUuid} proof={proof} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No pending payment proofs found.</p>
                            )}
                        </TabsContent>
                        <TabsContent value="reviewed" className="space-y-4 mt-4">
                            {counts.approved > 0 || counts.rejected > 0 ? proofs
                                .filter(proof => proof.paymentStatus === "approved" || proof.paymentStatus === "rejected")
                                .map((proof) => (
                                    <PaymentProofCard key={proof.paymentProofUuid} proof={proof} />
                                )) : (
                                <p className="text-center text-muted-foreground py-8">No reviewed payment proofs found.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default PaymentProofApprovalPage;
