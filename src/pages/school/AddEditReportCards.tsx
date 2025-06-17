"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";

// Zod schema for form validation based on the ReportCard entity
const reportCardSchema = z.object({
    academicYear: z.string().regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
    grade: z.string().min(1, "Grade is required."),
    semester: z.enum(["odd", "even"], { required_error: "Please select a semester." }),
    semesterDateStart: z.string().min(1, "Start date is required."),
    semesterDateEnd: z.string().min(1, "End date is required."),
    final_grade: z.string().min(1, "Final grade is required."),
    reportCardFile: z.any().optional(),
});

type ReportCardFormValues = z.infer<typeof reportCardSchema>;

function AddEditReportCards({ mode }: { mode: "add" | "edit" }) {
    const { childUuid, reportCardUuid } = useParams<{ childUuid?: string; reportCardUuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [associatedChildUuid, setAssociatedChildUuid] = useState<string | null>(childUuid || null);
    const axiosPrivate = useAxiosPrivate();

    const title = mode === 'edit' ? "Edit Report Card" : "Add New Report Card";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        { name: "Report Cards", url: associatedChildUuid ? `/school/children/${associatedChildUuid}/report-cards` : '#' },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<ReportCardFormValues>({
        resolver: zodResolver(reportCardSchema),
        defaultValues: {
            academicYear: "",
            grade: "",
            semester: undefined,
            semesterDateStart: "",
            semesterDateEnd: "",
            final_grade: "",
        }
    });

    useEffect(() => {
        if (mode === 'edit' && reportCardUuid) {
            const fetchReportCardData = async () => {
                setLoading(true);
                try {
                    const response = await axiosPrivate.get(`/v1/report-cards/${reportCardUuid}`);
                    const reportCardData = response.data;

                    form.reset(reportCardData);
                    setAssociatedChildUuid(reportCardData.childrenUuid);
                } catch (err) {
                    console.error("Failed to fetch report card data", err);
                    setError("Could not load report card data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchReportCardData();
        }
    }, [reportCardUuid, mode, form, axiosPrivate]);

    const onSubmit = async (data: ReportCardFormValues) => {
        setIsSubmitting(true);
        setError(null);

        if (!associatedChildUuid) {
            setError("Could not determine the associated child. Please go back and try again.");
            setIsSubmitting(false);
            return;
        }

        const file = data.reportCardFile?.[0];
        if (file) {
            console.log("File to upload:", file.name);
        }

        const submissionData = {
            ...data,
            childrenUuid: associatedChildUuid,
            reportCardFile: file ? `path/to/new-report-card.pdf` : (form.getValues('reportCardFile') || ''),
        };

        try {
            if (mode === 'edit') {
                await axiosPrivate.put(`/v1/report-cards/${reportCardUuid}`, submissionData);
            } else {
                await axiosPrivate.post('/v1/report-cards', submissionData);
            }
            navigate(`/school/children/${associatedChildUuid}/report-cards`);
        } catch (err) {
            console.error(`Failed to ${mode} report card`, err);
            setError(`An error occurred while saving the report card. Please try again.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 w-full items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle>Report Card Information</CardTitle>
                            <CardDescription>
                                {mode === 'edit' ? 'Update the details for this report card.' : 'Fill out the form to add a new report card.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField name="academicYear" control={form.control} render={({ field }) => (<FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input placeholder="e.g., 2024/2025" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="grade" control={form.control} render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl><Input placeholder="e.g., 4th" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="semester" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a semester" /></SelectTrigger></FormControl><SelectContent><SelectItem value="odd">Odd</SelectItem><SelectItem value="even">Even</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField name="final_grade" control={form.control} render={({ field }) => (<FormItem><FormLabel>Final Grade</FormLabel><FormControl><Input placeholder="e.g., A or 85" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="semesterDateStart" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="semesterDateEnd" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField
                                name="reportCardFile"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Upload Report Card (PDF)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={(event) => field.onChange(event.target.files)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoadingSpinner />}
                                    {mode === 'edit' ? 'Save Changes' : 'Add Report Card'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default AddEditReportCards;
