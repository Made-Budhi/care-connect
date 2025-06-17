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
import {Textarea} from "@/components/ui/textarea.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";

// Zod schema for form validation based on the Achievement entity
const achievementSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long."),
    description: z.string().min(10, "Description must be at least 10 characters long."),
    achievementType: z.enum(["academic", "non-academic"], { required_error: "Please select an achievement type." }),
    date: z.string().min(1, "The date of the achievement is required."),
    image: z.any().optional(), // File upload validation is handled in the component logic
});

type AchievementFormValues = z.infer<typeof achievementSchema>;

// REFACTORED: The component now accepts a 'mode' prop to determine its behavior.
function AddEditAchievement({ mode }: { mode: "add" | "edit" }) {
    // The component still gets UUIDs from the URL, but the logic now depends on the `mode`.
    const { childUuid, achievementUuid } = useParams<{ childUuid?: string; achievementUuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // This state holds the child's UUID needed for navigation and API calls.
    // It's set from the URL in 'add' mode, and from the fetched data in 'edit' mode.
    const [associatedChildUuid, setAssociatedChildUuid] = useState<string | null>(childUuid || null);

    const axiosPrivate = useAxiosPrivate();

    const title = mode === 'edit' ? "Edit Achievement" : "Add New Achievement";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        // Breadcrumb now robustly points to the correct child page
        { name: "Achievements", url: associatedChildUuid ? `/school/children/${associatedChildUuid}/achievements` : '#' },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<AchievementFormValues>({
        resolver: zodResolver(achievementSchema),
        defaultValues: {
            title: "",
            description: "",
            achievementType: undefined,
            date: "",
        }
    });

    // Fetch data only when in 'edit' mode.
    useEffect(() => {
        if (mode === 'edit' && achievementUuid) {
            const fetchAchievementData = async () => {
                setLoading(true);
                try {
                    const response = await axiosPrivate.get(`/v1/achievements/${achievementUuid}`);
                    const achievementData = response.data;

                    form.reset(achievementData);
                    setImagePreview(achievementData.image);
                    // Crucially, we set the associated child UUID from the fetched data
                    setAssociatedChildUuid(achievementData.childrenUuid);

                } catch (err) {
                    console.error("Failed to fetch achievement data", err);
                    setError("Could not load achievement data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchAchievementData();
        }
    }, [achievementUuid, mode, form, axiosPrivate]);

    const onSubmit = async (data: AchievementFormValues) => {
        setIsSubmitting(true);
        setError(null);

        // This ensures we have a child to associate the achievement with.
        if (!associatedChildUuid) {
            setError("Could not determine the associated child. Please go back and try again.");
            setIsSubmitting(false);
            return;
        }

        const file = data.image?.[0];
        if (file) {
            console.log("File to upload:", file.name);
        }

        const submissionData = {
            ...data,
            childrenUuid: associatedChildUuid, // Use the definitive child UUID
            image: file ? 'path/to/newly/uploaded/image.jpg' : imagePreview,
        };

        try {
            if (mode === 'edit') {
                await axiosPrivate.put(`/v1/achievements/${achievementUuid}`, submissionData);
            } else {
                await axiosPrivate.post('/v1/achievements', submissionData);
            }
            navigate(`/school/children/${associatedChildUuid}/achievements`);
        } catch (err) {
            console.error(`Failed to ${mode} achievement`, err);
            setError(`An error occurred while saving the achievement. Please try again.`);
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
                                <div className="space-y-2">
                                    <FormLabel>Achievement Picture</FormLabel>
                                    <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video">
                                        <img
                                            src={imagePreview || "https://placehold.co/600x400/e2e8f0/64748b?text=Image"}
                                            alt="Achievement preview"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <FormField
                                        name="image"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/png, image/jpeg"
                                                        onChange={(event) => {
                                                            const file = event.target.files?.[0];
                                                            if (file) {
                                                                setImagePreview(URL.createObjectURL(file));
                                                                field.onChange(event.target.files);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-4">
                                    <FormField name="title" control={form.control} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., First Place in Spelling Bee" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField name="achievementType" control={form.control} render={({ field }) => (<FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl><SelectContent><SelectItem value="academic">Academic</SelectItem><SelectItem value="non-academic">Non-Academic</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField name="date" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date Achieved</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
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
