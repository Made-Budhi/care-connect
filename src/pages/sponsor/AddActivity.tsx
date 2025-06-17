"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // For redirecting after success
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import useAuth from "@/hooks/useAuth.tsx"; // To get the sponsor's UUID
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

// Zod schema for the dynamic item donations
const itemDonationSchema = z.object({
    name: z.string().min(1, { message: "Item name cannot be empty." }),
    quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
});

// Zod schema for the main form
const eventSubmissionSchema = z.object({
    childUuid: z.string().min(1, { message: "You must select a foster child." }),
    dateStarted: z.string().min(1, { message: "Start date is required." }),
    timeStarted: z.string().min(1, { message: "Start time is required." }),
    dateEnded: z.string().min(1, { message: "End date is required." }),
    timeEnded: z.string().min(1, { message: "End time is required." }),
    activityDetail: z.string().min(10, { message: "Activity detail must be at least 10 characters." }),
    itemDonations: z.array(itemDonationSchema),
});

type EventFormValues = z.infer<typeof eventSubmissionSchema>;

// Interface for the child data we expect from the API for the dropdown
interface ChildSelectItem {
    uuid: string;
    name: string;
}

function AddActivitySubmissionPage() {
    const [children, setChildren] = useState<ChildSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const title = "Propose New Event";
    const breadcrumbs = [
        { name: "My Activity Submissions", url: "/sponsor/event-submissions" },
        { name: "New Activity" }
    ];

    useEffect(() => {
        const fetchChildren = async (sponsorUuid: string) => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get(`/v1/sponsor/${sponsorUuid}/children`);
                const childrenData = response.data.map((child: ChildSelectItem) => ({
                    uuid: child.uuid,
                    name: child.name,
                }));
                setChildren(childrenData);
            } catch (err) {
                console.error("Failed to fetch children list", err);
                setError("Could not load your list of foster children. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        if (auth?.uuid) {
            fetchChildren(auth.uuid);
        } else {
            setError("Could not identify sponsor. Please try logging in again.");
            setIsLoading(false);
        }
    }, [auth, axiosPrivate]);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSubmissionSchema),
        defaultValues: {
            childUuid: "",
            dateStarted: "",
            timeStarted: "",
            dateEnded: "",
            timeEnded: "",
            activityDetail: "",
            itemDonations: [],
        }
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "itemDonations"
    });

    const onSubmit = async (data: EventFormValues) => {
        setIsSubmitting(true);
        setError(null);

        const submissionPayload = {
            ...data,
            sponsorUuid: auth.uuid,
            // Combine date and time for the API
            eventStart: `${data.dateStarted} ${data.timeStarted}:00`,
            eventEnd: `${data.dateEnded} ${data.timeEnded}:00`,
        };
        console.log("Submitting form data:", submissionPayload);

        try {
            // This would call your actual API endpoint for creating an event submission
            // await axiosPrivate.post('/v1/event-submissions', submissionPayload);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/sponsor/event-submissions');

        } catch (err) {
            console.error("Failed to submit event", err);
            setError("Failed to submit event. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            </div>
        );
    }

    if (error && !children.length) { // Only show full-page error if children list failed
        return (
            <div className="space-y-8">
                <PageTitle title={title} breadcrumbs={breadcrumbs} />
                <p className="text-center text-red-500">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Event Submission Form</CardTitle>
                    <CardDescription>Fill out the details below to propose a new activity with a foster child.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="childUuid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>For which child?</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select a foster child" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {children.map(child => (
                                                    <SelectItem key={child.uuid} value={child.uuid}>{child.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="dateStarted" render={({ field }) => (
                                    <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="timeStarted" render={({ field }) => (
                                    <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="dateEnded" render={({ field }) => (
                                    <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="timeEnded" render={({ field }) => (
                                    <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <FormField control={form.control} name="activityDetail" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Activity Detail</FormLabel>
                                    <FormControl><Textarea placeholder="Describe the event, its purpose, location, and any other relevant details." className="resize-y min-h-[100px]" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <div>
                                <FormLabel>Requested Item Donations (Optional)</FormLabel>
                                <div className="space-y-4 pt-2">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-2">
                                            <FormField control={form.control} name={`itemDonations.${index}.name`} render={({ field }) => (
                                                <FormItem className="flex-1"><FormControl><Input placeholder="Item Name" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <FormField control={form.control} name={`itemDonations.${index}.quantity`} render={({ field }) => (
                                                <FormItem className="w-32"><FormControl><Input type="number" placeholder="Quantity" {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", quantity: 1 })}>
                                        Add Donation Item
                                    </Button>
                                </div>
                            </div>

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting && <LoadingSpinner />}
                                Submit Event Proposal
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default AddActivitySubmissionPage;
