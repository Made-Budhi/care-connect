"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";

// Zod schema for form validation based on the News entity
const newsSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters long."),
    description: z.string().min(20, "Description must be at least 20 characters long."),
    picture: z.any().optional(), // File upload validation is handled in the component
});

type NewsFormValues = z.infer<typeof newsSchema>;

function AddEditNewsPage({ mode }: { mode: "add" | "edit" }) {
    const { uuid } = useParams<{ uuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

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
                    // We need a GET /v1/news/:uuid endpoint, assuming it exists
                    const response = await axiosPrivate.get(`/v1/news/${uuid}`);
                    const newsData = response.data;

                    form.reset(newsData);
                    setImagePreview(newsData.picture);
                } catch (err) {
                    console.error("Failed to fetch news data", err);
                    setError("Could not load news article data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchNewsData();
        }
    }, [uuid, mode, form, axiosPrivate]);

    const onSubmit = async (data: NewsFormValues) => {
        setIsSubmitting(true);
        setError(null);

        // In a real app, you would handle the file upload here and get a URL.
        const file = data.picture?.[0];
        if (file) {
            console.log("File to upload:", file.name);
        }

        // Use the new image path if a file was uploaded, otherwise keep the existing one.
        const submissionData = {
            ...data,
            picture: file ? `path/to/uploaded/${file.name}` : imagePreview,
        };

        try {
            if (mode === 'edit') {
                await axiosPrivate.put(`/v1/news/${uuid}`, submissionData);
            } else {
                await axiosPrivate.post('/v1/news', submissionData);
            }
            navigate('/admin/news'); // Redirect to the list page on success
        } catch (err) {
            console.error(`Failed to ${mode} news article`, err);
            setError(`An error occurred while saving the article. Please try again.`);
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
