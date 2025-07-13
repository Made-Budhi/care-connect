"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { DetailRow } from "@/components/detail-row";
import {dateTimeFormat} from "@/lib/utils.ts";
import {Badge} from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog.tsx";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { supabase } from "@/lib/supabaseClient.ts";
import { toast } from "sonner";

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the dynamic item donations, matching the JSONB structure
interface ItemDonation {
    name: string;
    quantity: number;
}

// REFACTORED: Interface now matches the shape of the Supabase query response
interface EventSubmission {
    id: string;
    title: string;
    detail: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected';
    event_start_time: string;
    event_end_time: string;
    rejection_note: string | null;
    item_donations: ItemDonation[] | null;
    sponsor: { name: string } | null;
    school: { name: string } | null;
    child: { name: string } | null;
}

// Schema for the rejection form dialog
const rejectionSchema = z.object({
    rejectionNote: z.string().min(10, "Rejection note must be at least 10 characters.").optional(),
});
type RejectionFormValues = z.infer<typeof rejectionSchema>;


function ActivityDetail() {
    const [data, setData] = useState<EventSubmission | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isApproveDialogOpen, setApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);

    const { uuid } = useParams<{ uuid: string }>();

    const breadcrumbs: Breadcrumbs[] = [
        { name: "Activity Submissions", url: "/school/activities" },
        { name: "Detail" }
    ];

    const fetchEventSubmission = async () => {
        if (!uuid) {
            setError("Event Submission UUID is missing from the URL.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // REFACTORED: Direct Supabase call with joins
            const { data: submissionData, error: submissionError } = await supabase
                .from('activities')
                .select(`
                    *,
                    sponsor:sponsor_id ( name ),
                    school:school_id ( name ),
                    child:child_id ( name )
                `)
                .eq('id', uuid)
                .single();

            if (submissionError) throw submissionError;

            setData(submissionData);

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message || "Failed to load event submission data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEventSubmission();
    }, [uuid]);

    const rejectionForm = useForm<RejectionFormValues>({
        resolver: zodResolver(rejectionSchema),
        defaultValues: { rejectionNote: "" },
    });

    const handleApprove = async () => {
        try {
            const { error } = await supabase
                .from('activities')
                .update({ status: 'approved', rejection_note: null }) // Clear rejection note on approval
                .eq('id', uuid);

            if (error) throw error;

            toast.success("Submission approved successfully!");
            setApproveDialogOpen(false);
            await fetchEventSubmission(); // Refetch to show updated status
        } catch(err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error("Failed to approve submission.", { description: err.message });
        }
    };

    const handleReject = async (values: RejectionFormValues) => {
        try {
            const { error } = await supabase
                .from('activities')
                .update({ status: 'rejected', rejection_note: values.rejectionNote })
                .eq('id', uuid);

            if (error) throw error;

            toast.success("Submission rejected.");
            setRejectDialogOpen(false);
            await fetchEventSubmission(); // Refetch to show updated status
        } catch(err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            toast.error("Failed to reject submission.", { description: err.message });
        }
    };

    const StatusBadge = ({ status }: { status: 'pending' | 'approved' | 'rejected' }) => {
        const variant = {
            pending: "secondary",
            approved: "approved",
            rejected: "destructive",
        }[status] as "secondary" | "approved" | "destructive";

        return <Badge variant={variant} className="capitalize text-base">{status}</Badge>;
    };

    return (
        <div className="space-y-8">
            <PageTitle title={"Activity Submission Detail"} breadcrumbs={breadcrumbs} />

            <Card>
                {error && <div className="p-6 text-center text-red-500">{error}</div>}

                {loading ? (
                    <div className="my-10 flex justify-center">
                        <LoadingSpinner />
                    </div>
                ) : data && (
                    <>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{data.title}</CardTitle>
                                    <CardDescription className="pt-1">
                                        For <span className="font-medium text-primary">{data.child?.name || 'N/A'}</span>
                                    </CardDescription>
                                </div>
                                <StatusBadge status={data.status} />
                            </div>
                        </CardHeader>
                        <Separator />
                        <CardContent className="pt-6 grid md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Event Details</h3>
                                <DetailRow label="Location" value={data.location} />
                                <DetailRow label="Event Starts" value={dateTimeFormat(data.event_start_time)} />
                                <DetailRow label="Event Ends" value={dateTimeFormat(data.event_end_time)} />
                                <DetailRow label="Submitted By" value={data.sponsor?.name || 'Unknown'} />
                                <DetailRow label="For School" value={data.school?.name || 'Unknown'} />
                                <DetailRow label="Description" value={data.detail} />
                                {data.status === 'rejected' && (
                                    <DetailRow label="Rejection Reason" value={data.rejection_note} />
                                )}
                            </div>
                            {/* Right Column */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Requested Item Donations</h3>
                                {data.item_donations && data.item_donations.length > 0 ? (
                                    <div className="space-y-2 rounded-md border p-4">
                                        {data.item_donations.map((item, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span>{item.name}</span>
                                                <span className="font-medium">{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No item donations requested.</p>
                                )}
                            </div>
                        </CardContent>

                        {data.status === 'pending' && (
                            <>
                                <Separator />
                                <CardContent className="pt-6 flex justify-end gap-4">
                                    {/* Reject Button & Dialog */}
                                    <Dialog open={isRejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive">Reject</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Reject Event Submission</DialogTitle>
                                                <DialogDescription>
                                                    Provide a reason for rejecting this submission. This is optional but recommended.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <Form {...rejectionForm}>
                                                <form onSubmit={rejectionForm.handleSubmit(handleReject)} id="reject-form" className="space-y-4">
                                                    <FormField
                                                        control={rejectionForm.control}
                                                        name="rejectionNote"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Rejection Reason (Optional)</FormLabel>
                                                                <FormControl>
                                                                    <Textarea placeholder="e.g., Timing conflicts with another event." {...field} />
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
                                                <DialogTitle>Approve Event Submission?</DialogTitle>
                                                <DialogDescription>
                                                    This action will confirm your approval of this submission.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
                                                <Button onClick={handleApprove}>Confirm Approval</Button>
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
    )
}

export default ActivityDetail;
