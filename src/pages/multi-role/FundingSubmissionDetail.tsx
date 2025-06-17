"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { dateTimeFormat } from "@/lib/utils.ts";
import { DetailRow } from "@/components/detail-row";
import useAuth from "@/hooks/useAuth.tsx";

const title = "Funding Submission Detail";

interface FundingSubmissionDetail {
    uuid: string;
    status: 'pending' | 'rejected' | 'approved';
    date_requested: string;
    period: number;
    sponsorUuid: string;
    childrenCriteria: { grade?: string; age?: number; name?: string; school?: string; };
    foster_child_uuid?: string;
    notes?: string;
    rejectionReason?: string;
    approvalDate?: string;
    approved_by?: string;
    payment_link?: string;
}

interface PaymentProof {
    uuid: string; imagePath: string; dateUploaded: string; status: 'pending' | 'rejected' | 'approved';
}

const approvalSchema = z.object({
    payment_link: z.string().url({ message: "Please enter a valid URL." }).min(1),
    foster_child_uuid: z.string().min(1, "Matching a foster child is required."),
});
const rejectionSchema = z.object({ rejectionReason: z.string() });
const paymentProofSchema = z.object({
    paymentProofFile: z.instanceof(FileList).refine(files => files.length > 0, "A file is required."),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;
type RejectionFormValues = z.infer<typeof rejectionSchema>;
type PaymentProofFormValues = z.infer<typeof paymentProofSchema>;

function FundingSubmissionDetail({ mode, breadcrumbs }: { mode: "view" | "edit", breadcrumbs: { name: string, url?: string }[] }) {
    const [data, setData] = useState<FundingSubmissionDetail | null>(null);
    const [paymentProof, setPaymentProof] = useState<PaymentProof | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isApproveDialogOpen, setApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
    const axiosPrivate = useAxiosPrivate();
    const {auth} = useAuth();
    const { uuid } = useParams<{ uuid: string }>();

    const fetchAllData = async () => {
        if (!uuid) {
            setError("Submission UUID not found in URL.");
            setLoading(false);
            return;
        };
        setLoading(true);
        setError(null);
        try {
            const submissionResponse = await axiosPrivate.get(`/v1/funding-submissions/${uuid}`);
            const submissionData = submissionResponse.data;
            setData(submissionData);

            if (submissionData.status === 'approved') {
                try {
                    const proofResponse = await axiosPrivate.get(`/v1/payment-proofs/submission/${uuid}`);
                    setPaymentProof(proofResponse.data);
                } catch (proofError: unknown) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    if (proofError.response?.status === 404) {
                        setPaymentProof(null);
                    } else {
                        throw proofError;
                    }
                }
            }
        } catch (error) {
            console.error(error);
            setError("Failed to load submission data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [axiosPrivate, uuid]);

    const approvalForm = useForm<ApprovalFormValues>({ resolver: zodResolver(approvalSchema) });
    const rejectionForm = useForm<RejectionFormValues>({ resolver: zodResolver(rejectionSchema) });
    const paymentProofForm = useForm<PaymentProofFormValues>({ resolver: zodResolver(paymentProofSchema) });

    const handleApprove = async (values: ApprovalFormValues) => {
        try {
            await axiosPrivate.patch(`/v1/funding-submissions/${uuid}/approve`, values);
            setApproveDialogOpen(false);
            await fetchAllData();
        } catch(err) {
            console.error("Failed to approve submission", err);
        }
    };

    const handleReject = async (values: RejectionFormValues) => {
        try {
            await axiosPrivate.patch(`/v1/funding-submissions/${uuid}/reject`, values);
            setRejectDialogOpen(false);
            await fetchAllData();
        } catch(err) {
            console.error("Failed to reject submission", err);
        }
    };

    const handleProofUpload = async (values: PaymentProofFormValues) => {
        console.log("Uploading file:", values.paymentProofFile[0].name);

        const mockUploadPayload = {
            submissionUuid: uuid,
            imagePath: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=400', // Using a placeholder for mock
        };
        await axiosPrivate.post(`/v1/payment-proofs`, mockUploadPayload);
        await fetchAllData();
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const variant = {
            pending: "secondary", approved: "approved", rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive" | undefined;
        return <Badge variant={variant} className="capitalize">{status}</Badge>;
    };

    const renderPaymentProofSection = () => {
        if (data?.status !== 'approved' || auth.role !== 'sponsor') return null;

        const canUploadProof = true;

        return (
            <div className="space-y-4 pt-4 mt-4">
                <h3 className="font-semibold text-lg">Payment Proof</h3>
                {paymentProof ? (
                    <div className="space-y-4 lg:flex lg:flex-row-reverse lg:justify-between lg:items-start lg:gap-6">
                        <div className="bg-muted rounded-sm overflow-hidden basis-1/2">
                            <img src={paymentProof.imagePath} alt="Payment Proof" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80" }} />
                        </div>
                        <div className={"basis-1/2 space-y-6"}>
                            <DetailRow label="Upload Date" value={dateTimeFormat(paymentProof.dateUploaded)} />
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">Status</p>
                                <StatusBadge status={paymentProof.status} />
                            </div>
                        </div>
                    </div>
                ) : canUploadProof ? (
                    <Form {...paymentProofForm}>
                        <form onSubmit={paymentProofForm.handleSubmit(handleProofUpload)} className="space-y-4">
                            <FormField
                                control={paymentProofForm.control}
                                name="paymentProofFile"
                                render={({ field }) => (
                                    <FormItem className={"py-4"}>
                                        <FormLabel>Upload Proof of Payment</FormLabel>
                                        <FormControl className={"lg:w-1/2"}>
                                            <Input type="file" onChange={(e) => field.onChange(e.target.files)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit Proof</Button>
                        </form>
                    </Form>
                ) : (
                    <p className="text-sm text-muted-foreground">No payment proof has been uploaded for this submission yet.</p>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Card>
                {error && <div className="p-6 text-red-500 text-center">{error}</div>}

                {loading ? (
                    <div className="my-10 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : data && (
                    <>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="space-y-1.5">
                                    <div className="flex gap-2 items-center">
                                        <StatusBadge status={data.status} />
                                        <CardTitle>Submission ID: {data.uuid}</CardTitle>
                                    </div>
                                    <CardDescription>Requested on {dateTimeFormat(data.date_requested)}</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6">
                            <div className="lg:flex lg:justify-between lg:items-start lg:gap-6">
                                <div className={"w-full space-y-2"}>
                                    <h3 className="font-semibold text-lg">Submission Information</h3>
                                    {/*TODO: change into sponsor's name*/}
                                    <DetailRow label="Sponsor UUID" value={data.sponsorUuid} />
                                    <DetailRow label="Funding Period" value={`${data.period} year(s)`} />
                                    {data.notes && <DetailRow label="Sponsor Notes" value={data.notes} />}

                                    {data.status === 'approved' && data.approvalDate && (
                                        <>
                                            <DetailRow label="Approval Date" value={dateTimeFormat(data.approvalDate)} />
                                            <DetailRow label="Approved By" value={data.approved_by} />
                                            <DetailRow label="Payment Link" value={<a href={data.payment_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{data.payment_link}</a>} />
                                        </>
                                    )}
                                    {data.status === 'rejected' && (
                                        <DetailRow label="Rejection Reason" value={data.rejectionReason} />
                                    )}
                                </div>

                                <div className="w-full mt-8 space-y-2 lg:mt-0">
                                    <h3 className="font-semibold text-lg">Children Criteria</h3>
                                    <DetailRow label="Name" value={data.childrenCriteria.name} />
                                    <DetailRow label="Age" value={data.childrenCriteria.age} />
                                    <DetailRow label="Grade" value={data.childrenCriteria.grade} />
                                    <DetailRow label="School" value={data.childrenCriteria.school} />
                                </div>
                            </div>

                            {renderPaymentProofSection()}
                        </CardContent>

                        {/* Action Buttons for Pending Status */}
                        {mode === "edit" && data.status === "pending" && (
                            <>
                                <Separator className={"mt-8"} />
                                <CardContent className="pt-6 flex justify-end gap-4">
                                    {/* Reject Button & Dialog */}
                                    <Dialog open={isRejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="secondary">Reject</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Reject Submission</DialogTitle>
                                                <DialogDescription>
                                                    Provide a reason for rejecting this submission.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Form {...rejectionForm}>
                                                <form onSubmit={rejectionForm.handleSubmit(handleReject)} id="reject-form" className="space-y-4">
                                                    <FormField
                                                        control={rejectionForm.control}
                                                        name="rejectionReason"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Rejection Reason</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="e.g. Children with the criteria provided doesn't exist" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </form>
                                            </Form>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit" form="reject-form" variant="destructive">Confirm Rejection</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Approve Button & Dialog */}
                                    <Dialog open={isApproveDialogOpen} onOpenChange={setApproveDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button>Approve</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Approve Submission</DialogTitle>
                                                <DialogDescription>
                                                    To approve, match a foster child and provide the payment link for the sponsor.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Form {...approvalForm}>
                                                <form onSubmit={approvalForm.handleSubmit(handleApprove)} id="approve-form" className="space-y-4">
                                                    <FormField
                                                        control={approvalForm.control}
                                                        name="foster_child_uuid"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                {/*TODO: change into select option with foster children that haven't being funded yet*/}
                                                                <FormLabel>Foster Child UUID</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Enter the matched child's UUID" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={approvalForm.control}
                                                        name="payment_link"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Payment Link</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="https://payment-gateway.com/..." {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </form>
                                            </Form>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                                                <Button type="submit" form="approve-form">Confirm Approval</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}

export default FundingSubmissionDetail;
