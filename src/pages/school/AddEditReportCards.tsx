"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { supabase } from "@/lib/supabaseClient.ts";
import { toast } from "sonner";

const MAX_FILE_SIZE = 2048000; // 2MB
const ACCEPTED_FILE_TYPES = ["application/pdf"];

// Zod schema for form validation based on the ReportCard entity
const reportCardSchema = z.object({
    academic_year: z.string().regex(/^\d{4}\/\d{4}$/, "Format must be YYYY/YYYY (e.g., 2024/2025)"),
    grade: z.string().min(1, "Grade is required."),
    semester: z.enum(["odd", "even"], { required_error: "Please select a semester." }),
    semester_date_start: z.string().min(1, "Start date is required."),
    semester_date_end: z.string().min(1, "End date is required."),
    final_grade: z.string().min(1, "Final grade is required."),
    file: z
        .instanceof(FileList)
        .optional()
        .refine(files => {
            if (!files || files.length === 0) return true; // Optional field
            return files?.[0]?.size <= MAX_FILE_SIZE;
        }, `Max file size is 2MB.`)
        .refine(files => {
            if (!files || files.length === 0) return true;
            return ACCEPTED_FILE_TYPES.includes(files?.[0]?.type);
        }, "Only .pdf files are accepted."),
});

type ReportCardFormValues = z.infer<typeof reportCardSchema>;

function AddEditReportCards({ mode }: { mode: "add" | "edit" }) {
    const { childUuid, reportCardUuid } = useParams<{ childUuid?: string; reportCardUuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [associatedChildUuid, setAssociatedChildUuid] = useState<string | null>(childUuid || null);
    const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);

    const title = mode === 'edit' ? "Edit Report Card" : "Add New Report Card";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        { name: "Report Cards", url: associatedChildUuid ? `/school/children/${associatedChildUuid}/report-cards` : '#' },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<ReportCardFormValues>({
        resolver: zodResolver(reportCardSchema),
        defaultValues: {
            academic_year: "",
            grade: "",
            semester: undefined,
            semester_date_start: "",
            semester_date_end: "",
            final_grade: "",
        }
    });

    useEffect(() => {
        if (mode === 'edit' && reportCardUuid) {
            const fetchReportCardData = async () => {
                setLoading(true);
                try {
                    const {data: reportCardData, error} = await supabase
                        .from('report_cards')
                        .select('*')
                        .eq('id', reportCardUuid)
                        .single();

                    if (error) throw error;

                    setCurrentFilePath(reportCardData?.file_path);
                    form.reset(reportCardData);
                    setAssociatedChildUuid(reportCardData.child_id);
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    setError(message);
                } finally {
                    setLoading(false);
                }
            };
            fetchReportCardData();
        }
    }, [reportCardUuid, mode, form]);

    const onSubmit = async (data: ReportCardFormValues) => {
        setIsSubmitting(true);
        setError(null);

        if (!associatedChildUuid) {
            setError("Could not determine the associated child. Please go back and try again.");
            setIsSubmitting(false);
            return;
        }

        try {
            let filePath = currentFilePath; // Start with the existing path
            const file = data.file?.[0];

            if (file) {
                // If there's an old file in edit mode, delete it first
                if (mode === 'edit' && currentFilePath) {
                    const { error: deleteError } = await supabase.storage
                        .from('children-report-card')
                        .remove([currentFilePath]);
                    if (deleteError) throw deleteError;
                }

                // Create a new unique path and upload the new file
                const newFilePath = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('children-report-card')
                    .upload(newFilePath, file);

                if (uploadError) throw uploadError;
                filePath = newFilePath; // Update the path to the new file
            }

            const submissionData = {
                academic_year: data.academic_year,
                grade: data.grade,
                semester: data.semester,
                semester_date_start: data.semester_date_start,
                semester_date_end: data.semester_date_end,
                final_grade: data.final_grade,
                child_id: childUuid,
                file_path: filePath, // Save the file path to your database
            };

            if (mode === 'edit') {
                const { error } = await supabase.from('report_cards').update(submissionData).eq('id', reportCardUuid);
                if (error) throw error;
                toast.success("Report card updated successfully!");
            } else {
                const { error } = await supabase.from('report_cards').insert(submissionData);
                if (error) throw error;
                toast.success("Report card added successfully!");
            }
            navigate(`/school/children/${associatedChildUuid}/report-cards`);

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message);
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
                                <FormField name="academic_year" control={form.control} render={({ field }) => (<FormItem><FormLabel>Academic Year</FormLabel><FormControl><Input placeholder="e.g., 2024/2025" {...field} /></FormControl><FormMessage /></FormItem>)} />

                                <FormField name="grade" control={form.control} render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl className={"w-full"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a grade" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1st">1st Grade</SelectItem>
                                            <SelectItem value="2nd">2nd Grade</SelectItem>
                                            <SelectItem value="3rd">3rd Grade</SelectItem>
                                            <SelectItem value="4th">4th Grade</SelectItem>
                                            <SelectItem value="5th">5th Grade</SelectItem>
                                            <SelectItem value="6th">6th Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage /></FormItem>)} />

                                <FormField name="semester" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a semester" /></SelectTrigger></FormControl><SelectContent><SelectItem value="odd">Odd</SelectItem><SelectItem value="even">Even</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                <FormField name="final_grade" control={form.control} render={({ field }) => (<FormItem><FormLabel>Final Grade</FormLabel><FormControl><Input placeholder="e.g., A or 85" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="semester_date_start" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="semester_date_end" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>
                            <FormField
                                name="file"
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
                                        {mode === 'edit' && (
                                            <FormDescription>Leave this field blank to keep the current file.</FormDescription>
                                        )}
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
