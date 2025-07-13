"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import useAuth from "@/hooks/useAuth.tsx";
import {toast} from "sonner";

const MAX_FILE_SIZE = 2048000; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Zod schema for form validation based on the News entity
const newsSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(20, "Description must be at least 20 characters long."),
    picture: z
        .instanceof(FileList)
        .optional()
        .refine(files => {
            if (!files || files.length === 0) return true;
            return files?.[0]?.size <= MAX_FILE_SIZE;
        }, `Max image size is 2MB.`)
        .refine(files => {
            if (!files || files.length === 0) return true;
            return ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type);
        }, "Only .jpg, .jpeg, and .png formats are supported."),
});

type NewsFormValues = z.infer<typeof newsSchema>;

function AddEditNewsPage({ mode }: { mode: "add" | "edit" }) {
    const { uuid } = useParams<{ uuid?: string }>();
    const {auth} = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [currentImagePath, setCurrentImagePath] = useState<string | null>(null); // State to hold the old image path

    const title = mode === 'edit' ? "Edit News Article" : "Add New News Article";
    const breadcrumbs = [
        { name: "News Management", url: "/admin/news" },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<NewsFormValues>({
        resolver: zodResolver(newsSchema),
        defaultValues: {
            title: "",
            description: "",
        }
    });

    // Fetch data for edit mode
    useEffect(() => {
        if (mode === 'edit' && uuid) {
            const fetchNewsData = async () => {
                setLoading(true);
                try {
                    const {data, error} = await supabase.from('news').select('*').eq('id', uuid).single();
                    if (error) throw error;

                    form.reset(data);
                    // Set the path of the current image for potential deletion later
                    setCurrentImagePath(data.picture_url);

                    // Generate a temporary signed URL for the preview if the image path exists
                    if (data.picture_url) {
                        const { data: signedUrlData } = await supabase.storage.from('news').createSignedUrl(data.picture_url, 3600);
                        setImagePreview(signedUrlData?.signedUrl || null);
                    }
                } catch (error) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    setError(error.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchNewsData();
        }
    }, [uuid, mode, form]);

    const onSubmit = async (data: NewsFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            let imagePath = currentImagePath; // Start with the existing image path
            const file = data.picture?.[0];

            // --- REFACTORED: UPLOAD AND DELETE LOGIC ---
            if (file) {
                // 1. If in edit mode and an old image exists, delete it from storage.
                if (mode === 'edit' && currentImagePath) {
                    const { error: deleteError } = await supabase.storage.from('news').remove([currentImagePath]);
                    if (deleteError) {
                        // Log error but don't block the upload of the new image
                        console.error("Failed to delete old image:", deleteError.message);
                    }
                }

                // 2. Create a unique path and upload the new file.
                const newFilePath = `${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('news').upload(newFilePath, file);
                if (uploadError) throw uploadError;

                // 3. Update the imagePath to the newly uploaded file's path.
                imagePath = newFilePath;
            }
            // --- END OF REFACTORED LOGIC ---

            const submissionData = {
                author_id: auth.uuid,
                title: data.title,
                description: data.description,
                picture_url: imagePath, // Save the correct path to the database
            };

            if (mode === 'edit') {
                const {error} = await supabase.from('news').update(submissionData).eq('id', uuid);
                if (error) throw error;
                toast.success("News article updated successfully!");
            } else {
                const {error} = await supabase.from('news').insert(submissionData);
                if (error) throw error;
                toast.success("News article added successfully!");
            }
            navigate('/admin/news');

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
                            <CardTitle>Article Details</CardTitle>
                            <CardDescription>
                                {mode === 'edit' ? 'Update the details for this news article.' : 'Fill out the form to create a new news article.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Image Preview & Upload */}
                                <div className="space-y-2">
                                    <FormLabel>Article Picture</FormLabel>
                                    <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video">
                                        <img
                                            src={imagePreview || "https://placehold.co/600x400/e2e8f0/64748b?text=News+Image"}
                                            alt="News article preview"
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <FormField
                                        name="picture"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/png, image/jpeg, image/jpg"
                                                        onChange={(event) => {
                                                            const file = event.target.files?.[0];
                                                            if (file) {
                                                                setImagePreview(URL.createObjectURL(file));
                                                                field.onChange(event.target.files);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    {mode === 'edit' ? 'Leave blank to keep the current picture.' : 'Select an image for the article.'}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Title Field */}
                                <div className="space-y-4">
                                    <FormField name="title" control={form.control} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="Enter the article title" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            </div>
                            <FormField name="description" control={form.control} render={({ field }) => (<FormItem><FormLabel>Description / Content</FormLabel><FormControl><Textarea placeholder="Write the full content of the news article here..." className="min-h-[200px]" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoadingSpinner />}
                                    {mode === 'edit' ? 'Save Changes' : 'Publish Article'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default AddEditNewsPage;
