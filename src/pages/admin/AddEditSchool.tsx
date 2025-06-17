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
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";

// Zod schema for form validation based on the School entity
const schoolSchema = z.object({
    name: z.string().min(3, "School name must be at least 3 characters long."),
    region: z.string().min(3, "Region is required."),
    address: z.string().min(10, "A detailed address is required."),
    userUuid: z.string().uuid("A valid User UUID must be provided to manage the school."),
    latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90."),
    longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180."),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

function AddEditSchool({ mode }: { mode: "add" | "edit" }) {
    const { uuid } = useParams<{ uuid?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const title = mode === 'edit' ? "Edit School" : "Add New School";
    const breadcrumbs = [
        { name: "Schools", url: "/admin/schools" },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolSchema),
        defaultValues: {
            name: "",
            region: "",
            address: "",
            userUuid: "",
            latitude: 0,
            longitude: 0,
        }
    });

    useEffect(() => {
        if (mode === 'edit' && uuid) {
            const fetchSchoolData = async () => {
                setLoading(true);
                try {
                    const response = await axiosPrivate.get(`/v1/schools/${uuid}`);
                    form.reset(response.data);
                } catch (err) {
                    console.error("Failed to fetch school data", err);
                    setError("Could not load school data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchSchoolData();
        }
    }, [uuid, mode, form, axiosPrivate]);

    const onSubmit = async (data: SchoolFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (mode === 'edit') {
                await axiosPrivate.put(`/v1/schools/${uuid}`, data);
            } else {
                await axiosPrivate.post('/v1/schools', data);
            }
            navigate('/admin/schools'); // Redirect to the list page on success
        } catch (err) {
            console.error(`Failed to ${mode} school`, err);
            setError(`An error occurred while saving the school. Please try again.`);
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
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>
                                {mode === 'edit' ? 'Update the details for this school.' : 'Fill out the form to add a new school.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="e.g., SDN Menteng 01 Pagi" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="region" control={form.control} render={({ field }) => (<FormItem><FormLabel>Region</FormLabel><FormControl><Input placeholder="e.g., DKI Jakarta" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <FormField name="address" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Enter the full school address" className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField name="latitude" control={form.control} render={({ field }) => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" placeholder="-6.1954" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="longitude" control={form.control} render={({ field }) => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" placeholder="106.8272" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            <FormField name="userUuid" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Manager User UUID</FormLabel>
                                    <FormControl><Input placeholder="Enter the UUID of the user managing this school" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoadingSpinner />}
                                    {mode === 'edit' ? 'Save Changes' : 'Add School'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </Form>
        </div>
    );
}

export default AddEditSchool;
