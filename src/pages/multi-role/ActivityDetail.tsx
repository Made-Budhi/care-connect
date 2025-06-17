"use client"

import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
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

interface Breadcrumbs {
    name?: string;
    url?: string;
}

// Interface for the Event Submission entity, matching the mock API
interface ItemDonation {
    name: string;
    quantity: number;
}

interface EventSubmission {
    uuid: string;
    sponsorUuid: string;
    schoolId: string;
    title: string;
    detail: string;
    location: string;
    status: 'pending' | 'approved' | 'rejected';
    eventStart: string;
    eventEnd: string;
    rejectionNote?: string;
    itemDonations: ItemDonation[];
}

// Schema for the rejection form dialog
const rejectionSchema = z.object({
    rejectionNote: z.string().optional(),
});
type RejectionFormValues = z.infer<typeof rejectionSchema>;


function ActivityDetail({breadcrumbs}: {breadcrumbs: Breadcrumbs[]}) {
    const [data, setData] = useState<EventSubmission>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isApproveDialogOpen, setApproveDialogOpen] = useState(false);
    const [isRejectDialogOpen, setRejectDialogOpen] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    const { uuid } = useParams<{ uuid: string }>();

    const fetchEventSubmission = async () => {
        if (!uuid) {
            setError("Event Submission UUID is missing from the URL.");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axiosPrivate.get(`/v1/event-submissions/${uuid}`);
            setData(response.data);
        } catch (error) {
            console.error(error);
            setError("Failed to load event submission data.");
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
            await axiosPrivate.patch(`/v1/event-submissions/${uuid}/approve`);
            setApproveDialogOpen(false);
            await fetchEventSubmission(); // Refetch to show updated status
        } catch(err) {
            console.error("Failed to approve submission", err);
        }
    };

    const handleReject = async (values: RejectionFormValues) => {
        try {
            await axiosPrivate.patch(`/v1/event-submissions/${uuid}/reject`, values);
            setRejectDialogOpen(false);
            await fetchEventSubmission(); // Refetch to show updated status
        } catch(err) {
            console.error("Failed to reject submission", err);
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
                                    <CardDescription className="pt-1">{data.detail}</CardDescription>
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
                                <DetailRow label="Event Starts" value={dateTimeFormat(data.eventStart)} />
                                <DetailRow label="Event Ends" value={dateTimeFormat(data.eventEnd)} />
                                <DetailRow label="Sponsor Name" value={data.sponsorUuid} />
                                {/* TODO: Change to actual sponsor's and school's name, not ID*/}
                                <DetailRow label="School" value={data.schoolId} />
                                <DetailRow label="Detail" value={data.detail} />
                                {data.status === 'rejected' && (
                                    <DetailRow label="Rejection Reason" value={data.rejectionNote} />
                                )}
                            </div>
                            {/* Right Column */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Requested Item Donations</h3>
                                {data.itemDonations.length > 0 ? (
                                    <div className="space-y-2 rounded-md border p-4">
                                        {data.itemDonations.map((item, index) => (
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
                                            <Button variant="outline">Reject</Button>
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
                                                    This will make the event publicly visible. This action cannot be undone.
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
