"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import { useState } from "react";
import { useNavigate } from "react-router"; // For redirecting after success
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import useAuth from "@/hooks/useAuth.tsx"; // To get the sponsor's UUID
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Zod schema for the main form
const fundingSubmissionSchema = z.object({
    childrenCriteria: z.object({
        name: z.string().optional(),
        age: z.coerce.number().positive({ message: "Age must be a positive number." }).optional().or(z.literal('')),
        gender: z.enum(["Male", "Female"]).optional(),
        school: z.string().optional(),
    }),
    period: z.coerce.number({ required_error: "Funding period is required." }).min(1, { message: "Period must be at least 1 year." }),
    note: z.string().optional(),
});

type FundingSubmissionFormValues = z.infer<typeof fundingSubmissionSchema>;

function AddFundingSubmissionPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { auth } = useAuth();

    const title = "Propose New Funding";
    const breadcrumbs = [
        { name: "My Funding Submissions", url: "/sponsor/funding" },
        { name: "Propose Funding" }
    ];

    const form = useForm<FundingSubmissionFormValues>({
        resolver: zodResolver(fundingSubmissionSchema),
        defaultValues: {
            childrenCriteria: {
                name: "",
                age: undefined,
                gender: undefined,
                school: "",
            },
            period: 1,
            note: "",
        }
    });

    const onSubmit = async (data: FundingSubmissionFormValues) => {
        setIsSubmitting(true);
        setError(null);

        const submissionPayload = {
            sponsorUuid: auth.uuid,
            period: data.period,
            childrenCriteria: {
                ...data.childrenCriteria,
                // Ensure optional age is not sent as an empty string if not filled
                age: data.childrenCriteria.age || undefined
            },
            notes: data.note,
        };
        console.log("Submitting form data:", submissionPayload);

        try {
            // This would call your actual API endpoint for creating a funding submission
            await axiosPrivate.post('/v1/funding-submissions', submissionPayload);
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/sponsor/funding');

        } catch (err) {
            console.error("Failed to submit funding proposal", err);
            setError("Failed to submit proposal. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Card className="max-w-3xl mx-auto">
                <CardHeader>
                    <CardTitle>Funding Proposal Form</CardTitle>
                    <CardDescription>Fill out the criteria for the child you wish to fund. All criteria fields are optional.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium">Children Criteria</h3>
                                <p className="text-sm text-muted-foreground">
                                    Specify the criteria for the foster child you want to support.
                                </p>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <FormField control={form.control} name="childrenCriteria.name" render={({ field }) => (
                                    <FormItem><FormLabel>Child's Name</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="childrenCriteria.age" render={({ field }) => (
                                    <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="childrenCriteria.gender" render={({ field }) => (
                                    <FormItem><FormLabel>Gender</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Any Gender" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="childrenCriteria.school" render={({ field }) => (
                                    <FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="e.g., Sunshine Elementary" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-lg font-medium">Funding Details</h3>
                                <p className="text-sm text-muted-foreground">
                                    Specify the duration of your funding commitment.
                                </p>
                            </div>

                            <FormField control={form.control} name="period" render={({ field }) => (
                                <FormItem className="max-w-xs">
                                    <FormLabel>Funding Period (in years)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 3" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            <FormField control={form.control} name="note" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Note (Optional)</FormLabel>
                                    <FormControl><Textarea placeholder="Add any additional notes or specific requests regarding your funding proposal." className="resize-y" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <LoadingSpinner />}
                                Submit Funding Proposal
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default AddFundingSubmissionPage;
