"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import useAuth from "@/hooks/useAuth.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";

// --- Zod Schemas ---
const personalInfoSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    email: z.string().email("Please enter a valid email."),
});

const schoolProfileSchema = z.object({
    name: z.string().min(3, "School name is required."),
    region: z.string().min(3, "Region is required."),
    address: z.string().min(10, "A detailed address is required."),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;
type SchoolProfileFormValues = z.infer<typeof schoolProfileSchema>;

// --- Interfaces ---
// interface UserProfile {
//     uuid: string; name: string; email: string; role: string;
// }
interface SchoolDetail {
    uuid: string; name: string; region: string; address: string; latitude: number; longitude: number;
}

// --- School Profile Form Sub-component ---
// This makes the main component cleaner
const SchoolProfileForm = ({ userUuid }: { userUuid: string }) => {
    const [school, setSchool] = useState<SchoolDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const form = useForm<SchoolProfileFormValues>({
        resolver: zodResolver(schoolProfileSchema),
        defaultValues: { name: "", region: "", address: "", latitude: 0, longitude: 0 }
    });

    useEffect(() => {
        const fetchSchoolProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get(`/v1/schools/user/${userUuid}`);
                setSchool(response.data);
                form.reset(response.data);
            } catch (err) {
                console.error(err);
                setError("Could not load your school's profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchSchoolProfile();
    }, [userUuid, axiosPrivate, form]);

    const onSubmit = async (data: SchoolProfileFormValues) => {
        if (!school) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await axiosPrivate.put(`/v1/schools/${school.uuid}`, data);
            alert("School profile updated successfully!");
        } catch (err) {
            console.error(err);
            setError("An error occurred while saving the school profile.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
    if (error) return <p className="text-center text-red-500 p-8">{error}</p>;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>School Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="region" control={form.control} render={({ field }) => (<FormItem><FormLabel>Region</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                <FormField name="address" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea className="min-h-[100px]" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField name="latitude" control={form.control} render={({ field }) => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField name="longitude" control={form.control} render={({ field }) => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                {form.formState.errors.root && <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>}
                <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <LoadingSpinner />}
                        Save School Info
                    </Button>
                </div>
            </form>
        </Form>
    );
};

// --- Main Profile Page Component ---
function UserProfilePage() {
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const form = useForm<PersonalInfoFormValues>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: { name: "", email: "" },
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axiosPrivate.get('/v1/users/me');
                form.reset(response.data);
            } catch(err) {
                console.error(err);
                setError("Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };
        if(auth) fetchUserProfile();
    }, [auth, axiosPrivate, form]);

    const onSubmitPersonalInfo = async (data: PersonalInfoFormValues) => {
        if (!auth?.uuid) return;
        setIsSubmitting(true);
        setError(null);
        try {
            await axiosPrivate.put(`/v1/users/${auth.uuid}`, data);
            alert("Personal info updated successfully!");
        } catch(err) {
            console.error(err);
            setError("Failed to update personal info.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="flex h-64 w-full items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="space-y-8">
            <PageTitle title="My Profile" breadcrumbs={[{ name: "Profile" }]} />
            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
                    <TabsTrigger value="personal">Personal Information</TabsTrigger>
                    {/* Conditionally render the school tab */}
                    {auth?.role === 'school' && (
                        <TabsTrigger value="school">School Information</TabsTrigger>
                    )}
                </TabsList>

                {/* Personal Info Tab Content */}
                <TabsContent value="personal">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader><CardTitle>Personal Details</CardTitle><CardDescription>Update your name and email address.</CardDescription></CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmitPersonalInfo)} className="space-y-6">
                                    <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField name="email" control={form.control} render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}
                                    <div className="flex justify-end">
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting && <LoadingSpinner />}
                                            Save Personal Info
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* School Info Tab Content */}
                {auth?.role === 'school' && (
                    <TabsContent value="school">
                        <Card className="max-w-4xl mx-auto">
                            <CardHeader><CardTitle>School Details</CardTitle><CardDescription>Update your school's public information.</CardDescription></CardHeader>
                            <CardContent>
                                {auth.uuid ? <SchoolProfileForm userUuid={auth.uuid} /> : <p>Loading user data...</p>}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}

export default UserProfilePage;
