"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Trash2, Users, Check, ChevronsUpDown } from "lucide-react";
import { supabase } from "@/lib/supabaseClient.ts";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.tsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

// Zod schema for the dynamic item donations
const itemDonationSchema = z.object({
    name: z.string().min(1, { message: "Item name cannot be empty." }),
    quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
});

// Zod schema for the main form
const eventSubmissionSchema = z.object({
    child_id: z.string().uuid({ message: "You must select a foster child." }),
    title: z.string().min(5, "Title must be at least 5 characters."),
    detail: z.string().min(10, { message: "Activity detail must be at least 10 characters." }),
    location: z.string().min(3, "Location is required."),
    eventStart: z.string().min(1, { message: "Start date and time are required." }),
    eventEnd: z.string().min(1, { message: "End date and time are required." }),
    itemDonations: z.array(itemDonationSchema),
});

type EventFormValues = z.infer<typeof eventSubmissionSchema>;

interface ChildSelectItem {
    id: string;
    school_id: string;
    name: string;
}

function AddActivitySubmissionPage() {
    const [children, setChildren] = useState<ChildSelectItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const title = "Propose New Event";
    const breadcrumbs = [
        { name: "My Activity Submissions", url: "/sponsor/funding" },
        { name: "New Activity" }
    ];

    useEffect(() => {
        const fetchSponsoredChildren = async (sponsorUuid: string) => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all funding submissions for the sponsor that have a matched child
                const { data, error } = await supabase
                    .from('funding_submissions')
                    .select('child:matched_child_id (id, name, school_id)')
                    .eq('sponsor_id', sponsorUuid)
                    .not('matched_child_id', 'is', null);

                if (error) throw error;

                // Extract the unique children from the submissions
                const childrenData = data
                    .map(sub => sub.child)
                    .filter((child, index, self) =>
                        child && self.findIndex(c => c.id === child.id) === index
                    );

                setChildren(childrenData as ChildSelectItem[]);
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message || "Failed to load your sponsored children.");
            } finally {
                setIsLoading(false);
            }
        };

        if (auth?.uuid) {
            fetchSponsoredChildren(auth.uuid);
        } else {
            setError("Could not identify sponsor. Please log in again.");
            setIsLoading(false);
        }
    }, [auth]);

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSubmissionSchema),
        defaultValues: {
            child_id: "",
            title: "",
            detail: "",
            location: "",
            eventStart: "",
            eventEnd: "",
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

        const schoolId = children.find(child => child.id === data.child_id)?.school_id;

        try {
            const submissionPayload = {
                sponsor_id: auth.uuid,
                child_id: data.child_id,
                school_id: schoolId,
                title: data.title,
                detail: data.detail,
                location: data.location,
                event_start_time: new Date(data.eventStart).toISOString(),
                event_end_time: new Date(data.eventEnd).toISOString(),
                item_donations: data.itemDonations,
                status: 'pending',
            };

            const { error: insertError } = await supabase
                .from('activities')
                .insert([submissionPayload]);

            if (insertError) throw insertError;

            toast.success("Event proposal submitted successfully!");
            navigate('/sponsor/activities');

        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(err.message || "Failed to submit event proposal.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        }

        if (error) {
            return <p className="text-center text-red-500 py-10">{error}</p>;
        }

        if (children.length === 0) {
            return (
                <div className="text-center py-16 px-6">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No Sponsored Children Found</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                        You need to sponsor at least one child before you can propose an event.
                    </p>
                    <Button asChild className="mt-6" variant={"ccbutton"}>
                        <Link to="/sponsor/children/find">Sponsor a Child</Link>
                    </Button>
                </div>
            );
        }

        return (
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="child_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>For which child?</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                        {field.value ? children.find(child => child.id === field.value)?.name : "Select a foster child"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl></PopoverTrigger><PopoverContent className="p-0 w-[--radix-popover-trigger-width]"><Command>
                                    <CommandInput placeholder="Search for child..." />
                                    <CommandList><CommandEmpty>No child found.</CommandEmpty><CommandGroup>
                                        {children.map(child => (
                                            <CommandItem value={child.name} key={child.id} onSelect={() => form.setValue("child_id", child.id)}>
                                                <Check className={cn("mr-2 h-4 w-4", child.id === field.value ? "opacity-100" : "opacity-0")} />
                                                {child.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup></CommandList>
                                </Command></PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="e.g., Charity Book Fair" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Sunshine Elementary School Hall" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="eventStart" render={({ field }) => (<FormItem><FormLabel>Start Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                        <FormField control={form.control} name="eventEnd" render={({ field }) => (<FormItem><FormLabel>End Date & Time</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                    </div>

                    <FormField control={form.control} name="detail" render={({ field }) => (<FormItem><FormLabel>Activity Detail</FormLabel><FormControl><Textarea placeholder="Describe the event, its purpose, and any other relevant details." className="resize-y min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)}/>

                    <div>
                        <FormLabel>Requested Item Donations (Optional)</FormLabel>
                        <div className="space-y-4 pt-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-2">
                                    <FormField control={form.control} name={`itemDonations.${index}.name`} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input placeholder="Item Name" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <FormField control={form.control} name={`itemDonations.${index}.quantity`} render={({ field }) => (<FormItem className="w-32"><FormControl><Input type="number" placeholder="Quantity" {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", quantity: 1 })}>Add Donation Item</Button>
                        </div>
                    </div>

                    {form.formState.errors.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoadingSpinner />}
                            Submit Event Proposal
                        </Button>
                    </div>
                </form>
            </Form>
        );
    };

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Event Submission Form</CardTitle>
                    <CardDescription>Fill out the details below to propose a new activity with a foster child.</CardDescription>
                </CardHeader>
                <CardContent>
                    {renderContent()}
                </CardContent>
            </Card>
        </div>
    );
}

export default AddActivitySubmissionPage;
