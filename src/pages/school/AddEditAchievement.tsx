"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { supabase } from "@/lib/supabaseClient.ts";
import {toast} from "sonner"; // Assuming you have this client setup

const MAX_FILE_SIZE = 2048000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// FIX: The Zod schema definition was incorrect.
const achievementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    achievement_type: z.enum(["academic", "non-academic"], { required_error: "Please select an achievement type." }),
    date_achieved: z.string().min(1, "The date of the achievement is required."),
    image: z
        .instanceof(FileList)
        .optional()
        .refine(files => {
            // This allows the field to be optional
            if (!files || files.length === 0) return true;
            // Otherwise, validate the first file
            return files?.[0]?.size <= MAX_FILE_SIZE;
        }, `Max image size is 2MB.`)
        .refine(files => {
            if (!files || files.length === 0) return true;
            return ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type);
        }, "Only .jpg, .jpeg, and .png formats are supported."),
});

// FIX: The type declaration must be a separate statement.
type AchievementFormValues = z.infer<typeof achievementSchema>;

function AddEditAchievement({ mode }: { mode: "add" | "edit" }) {
    const { childUuid, achievementUuid } = useParams<{ childUuid?: string; achievementUuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [associatedChildUuid, setAssociatedChildUuid] = useState<string | null>(childUuid || null);
    const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);

    const title = mode === 'edit' ? "Edit Achievement" : "Add New Achievement";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        { name: "Achievements", url: associatedChildUuid ? `/school/children/${associatedChildUuid}/achievements` : '#' },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<AchievementFormValues>({
        resolver: zodResolver(achievementSchema),
        defaultValues: {
            title: "",
            description: "",
            achievement_type: undefined,
            date_achieved: "",
        }
    });

    useEffect(() => {
        // FIX: setLoading(true) should be inside the condition.
        if (mode === 'edit' && achievementUuid) {
            const fetchAchievementData = async () => {
                setLoading(true);
                try {
                    const {data: achievementData, error} = await supabase
                        .from('achievements')
                        .select('title, description, achievement_type, date_achieved, image_url, child_id')
                        .eq('id', achievementUuid)
                        .single();

                    if (error) throw error;

                    setCurrentImagePath(achievementData?.image_url);
                    form.reset(achievementData);

                    setAssociatedChildUuid(achievementData.child_id);

                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    setError(message);
                } finally {
                    setLoading(false);
                }
            };
            fetchAchievementData();
        }
    }, [achievementUuid, mode, form]);

    const onSubmit = async (data: AchievementFormValues) => {
        setIsSubmitting(true);
        setError(null);

        if (!associatedChildUuid) {
            setError("Could not determine the associated child. Please go back and try again.");
            setIsSubmitting(false);
            return;
        }

        try {
            let imagePath;
            const file = data.image?.[0];

            // --- REFACTORED: Supabase Private Upload Logic ---
            if (file) {
                const filePath = `${Date.now()}-${file.name}`;

                // Upload the file to your private Supabase bucket.
                const { error: uploadError } = await supabase.storage
                    .from('children-achievement') // Your private bucket name
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                imagePath = filePath;
            }
            // --- End of Upload Logic ---

            const submissionData = {
                title: data.title,
                description: data.description,
                achievement_type: data.achievement_type,
                date_achieved: data.date_achieved,
                child_id: associatedChildUuid,
                image_url: imagePath, // Save the file path to your database
            };

            if (mode === 'edit') {
                // Delete the old image if it exists
                if (file) {
                    if (currentImagePath) {
                        const { error: deleteError } = await supabase.storage
                            .from('children-achievement') // Your private bucket name
                            .remove([currentImagePath]);

                        if (deleteError) throw deleteError.message;
                    }
                }

                const { error } = await supabase.from('achievements').update(submissionData).eq('id', achievementUuid);
                if (error) throw error;

                toast.success("Achievement updated successfully!");
            } else {
                const { error } = await supabase.from('achievements').insert(submissionData);

                if (error) throw error;

                toast.success("Achievement added successfully!");
            }
            navigate(`/school/children/${associatedChildUuid}/achievements`);

        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setError(message);
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
                            <CardTitle>Achievement Information</CardTitle>
                            <CardDescription>
                                {mode === 'edit' ? 'Update the details for this achievement.' : 'Fill out the form to add a new achievement.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Image Preview & Upload */}
                                <div className="space-y-4">
                                    <FormField name="title" control={form.control} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., First Place in Spelling Bee" {...field} /></FormControl><FormMessage /></FormItem>)} />

                                    <FormField
                                        name="image"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Achievement Picture</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={(event) => {
                                                            const file = event.target.files?.[0];
                                                            if (file) {
                                                                field.onChange(event.target.files);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                {mode === 'edit' && (
                                                    <FormDescription>Leave this field blank to keep the current picture.</FormDescription>
                                                )}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <FormField name="achievement_type" control={form.control} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="academic">Academic</SelectItem><SelectItem value="non-academic">Non-Academic</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField name="date_achieved" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date Achieved</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            <FormField name="description" control={form.control} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the achievement in detail..." className="min-h-[120px]" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoadingSpinner />}
                                    {mode === 'edit' ? 'Save Changes' : 'Add Achievement'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default AddEditAchievement;
