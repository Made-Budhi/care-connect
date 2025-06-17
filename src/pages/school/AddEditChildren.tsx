"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
// import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Trash2} from "lucide-react";

// Zod schema for validation, covering the full Child entity
const childSchema = z.object({
    name: z.string().min(1, "Name is required."),
    schoolName: z.string().min(1, "School name is required."),
    dateOfBirth: z.string().min(1, "Date of birth is required."),
    gender: z.enum(["Male", "Female"], { required_error: "Gender is required."}),
    grade: z.string().min(1, "Grade is required."),
    semester: z.string().min(1, "Semester is required."),
    shoesSize: z.string().min(1, "Shoes size is required."),
    shirtSize: z.string().min(1, "Shirt size is required."),
    fatherName: z.string().min(1, "Father's name is required."),
    fatherJob: z.string().min(1, "Father's job is required."),
    motherName: z.string().min(1, "Mother's name is required."),
    dreams: z.string().min(1, "Dreams are required."),
    picture: z.any().optional(), // File uploads are handled separately
    hobbies: z.array(z.object({ value: z.string().min(1, "Hobby cannot be empty.") })),
    favoriteSubjects: z.array(z.object({ value: z.string().min(1, "Subject cannot be empty.") })),
    siblings: z.array(z.object({
        name: z.string().min(1, "Sibling's name is required."),
        gender: z.enum(["Male", "Female"], { required_error: "Sibling's gender is required."}),
        dateOfBirth: z.string().min(1, "Sibling's date of birth is required.")
    })),
});

type ChildFormValues = z.infer<typeof childSchema>;

function AddEditChildren() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const mode = uuid ? 'edit' : 'add';

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate();

    const title = mode === 'edit' ? "Edit Foster Child" : "Add New Foster Child";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<ChildFormValues>({
        resolver: zodResolver(childSchema),
        defaultValues: {
            name: "", schoolName: "", dateOfBirth: "", grade: "", semester: "", shoesSize: "",
            shirtSize: "", fatherName: "", fatherJob: "", motherName: "", dreams: "",
            hobbies: [], favoriteSubjects: [], siblings: [],
        }
    });

    // Fetch data for edit mode
    useEffect(() => {
        if (mode === 'edit' && uuid) {
            const fetchChildData = async () => {
                setLoading(true);
                try {
                    const response = await axiosPrivate.get(`/v1/children/${uuid}`);
                    const childData = response.data;
                    // Format arrays for useFieldArray
                    const formattedData = {
                        ...childData,
                        hobbies: childData.hobbies.map((h: string) => ({ value: h })),
                        favoriteSubjects: childData.favoriteSubjects.map((s: string) => ({ value: s }))
                    };
                    form.reset(formattedData);
                } catch (err) {
                    console.error("Failed to fetch child data", err);
                    setError("Could not load child data. Please try again.");
                } finally {
                    setLoading(false);
                }
            };
            fetchChildData();
        }
    }, [uuid, mode, form, axiosPrivate]);

    const { fields: hobbyFields, append: appendHobby, remove: removeHobby } = useFieldArray({ control: form.control, name: "hobbies" });
    const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({ control: form.control, name: "favoriteSubjects" });
    const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({ control: form.control, name: "siblings" });

    const onSubmit = async (data: ChildFormValues) => {
        setIsSubmitting(true);
        setError(null);

        // Transform arrays back to simple strings for the API
        const submissionData = {
            ...data,
            hobbies: data.hobbies.map(h => h.value),
            favoriteSubjects: data.favoriteSubjects.map(s => s.value),
        };

        try {
            if (mode === 'edit') {
                await axiosPrivate.put(`/v1/children/${uuid}`, submissionData);
            } else {
                await axiosPrivate.post('/v1/children', submissionData);
            }
            navigate('/school/children'); // Redirect to the list page on success
        } catch (err) {
            console.error(`Failed to ${mode} child`, err);
            setError(`An error occurred while saving the child. Please try again.`);
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
                    <Card>
                        <CardHeader><CardTitle>Personal & School Information</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="dateOfBirth" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="gender" control={form.control} render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                            {/* TODO: implement picture upload */}
                            <FormField name="picture" control={form.control} render={() => (<FormItem><FormLabel>Profile Picture</FormLabel><FormControl><Input type="file" /></FormControl><FormMessage /></FormItem>)} />
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="academic">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="academic">Academic & Interests</TabsTrigger>
                            <TabsTrigger value="family">Family Information</TabsTrigger>
                        </TabsList>

                        <TabsContent value="academic">
                            <Card>
                                <CardHeader><CardTitle>Academic & Interests</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField name="grade" control={form.control} render={({ field }) => (<FormItem><FormLabel>Grade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="semester" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="shoesSize" control={form.control} render={({ field }) => (<FormItem><FormLabel>Shoes Size</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="shirtSize" control={form.control} render={({ field }) => (<FormItem><FormLabel>Shirt Size</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <FormField name="dreams" control={form.control} render={({ field }) => (<FormItem><FormLabel>Dreams & Aspirations</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

                                    {/* Dynamic Fields */}
                                    <div><FormLabel>Hobbies</FormLabel>{hobbyFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 pt-2"><FormField name={`hobbies.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeHobby(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}<Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendHobby({ value: "" })}>Add Hobby</Button></div>
                                    <div><FormLabel>Favorite Subjects</FormLabel>{subjectFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 pt-2"><FormField name={`favoriteSubjects.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}<Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSubject({ value: "" })}>Add Subject</Button></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="family">
                            <Card>
                                <CardHeader><CardTitle>Family Information</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField name="fatherName" control={form.control} render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="fatherJob" control={form.control} render={({ field }) => (<FormItem><FormLabel>Father's Job</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="motherName" control={form.control} render={({ field }) => (<FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <div><FormLabel>Siblings</FormLabel>{siblingFields.map((field, index) => (<Card key={field.id} className="p-4 mt-2"><div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"><FormField name={`siblings.${index}.name`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Sibling Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField name={`siblings.${index}.gender`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><FormField name={`siblings.${index}.dateOfBirth`} control={form.control} render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} /></div><Button type="button" variant="link" size="sm" className="text-destructive px-0 mt-2" onClick={() => removeSibling(index)}>Remove Sibling</Button></Card>))}<Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSibling({ name: "", gender: "Male", dateOfBirth: "" })}>Add Sibling</Button></div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <LoadingSpinner />}
                            {mode === 'edit' ? 'Save Changes' : 'Add Child'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

export default AddEditChildren;
