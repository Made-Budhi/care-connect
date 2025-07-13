"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {Trash2} from "lucide-react";
import {supabase} from "@/lib/supabaseClient.ts";
import useAuth from "@/hooks/useAuth.tsx";
import {toast} from "sonner";

const MAX_FILE_SIZE = 2048000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Zod schema for validation, covering the full Child entity
const childSchema = z.object({
    name: z.string().min(1, "Name is required."),
    school_id: z.string().min(1, "School name is required."),
    date_of_birth: z.string().min(1, "Date of birth is required."),
    gender: z.enum(["Male", "Female"], { required_error: "Gender is required."}),
    grade: z.string().min(1, "Grade is required."),
    semester: z.string().min(1, "Semester is required."),
    shoes_size: z.string().min(1, "Shoes size is required."),
    shirt_size: z.string().min(1, "Shirt size is required."),
    father_name: z.string().min(1, "Father's name is required."),
    father_job: z.string().min(1, "Father's job is required."),
    mother_name: z.string().min(1, "Mother's name is required."),
    dreams: z.string().min(1, "Dreams are required."),

    picture: z
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

    hobbies: z.array(z.object({ value: z.string().min(1, "Hobby cannot be empty.") })),
    favorite_subjects: z.array(z.object({ value: z.string().min(1, "Subject cannot be empty.") })),
    siblings: z.array(z.object({
        name: z.string().min(1, "Sibling's name is required."),
        gender: z.enum(["Male", "Female"], { required_error: "Sibling's gender is required."}),
        date_of_birth: z.string().min(1, "Sibling's date of birth is required.")
    })),
});

type ChildFormValues = z.infer<typeof childSchema>;

export function AddEditChildren() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const mode = uuid ? 'edit' : 'add';
    const {auth} = useAuth();

    const [currentPicturePath, setCurrentPicturePath] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const title = mode === 'edit' ? "Edit Foster Child" : "Add New Foster Child";
    const breadcrumbs = [
        { name: "Child List", url: "/school/children" },
        { name: mode === 'edit' ? "Edit" : "Add" }
    ];

    const form = useForm<ChildFormValues>({
        resolver: zodResolver(childSchema),
        defaultValues: {
            name: "", school_id: "", date_of_birth: "", grade: "", semester: "", shoes_size: "",
            shirt_size: "", father_name: "", father_job: "", mother_name: "", dreams: "",
            hobbies: [], favorite_subjects: [], siblings: [],
        }
    });

    // Fetch data for edit mode
    useEffect(() => {
        setLoading(true);
        const fetchSchoolId = async () => {
            try {
                const {data: schoolId, error} = await supabase.from('schools').select('id').eq('manager_id', auth.uuid).single();
                
                if (error) throw new Error(error.message);
                form.setValue("school_id", schoolId.id)
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setError(message);
            }
        }
        
        const fetchChildData = async () => {
            try {
                const {data: childData, error} = await supabase.from('children').select('*').eq('id', uuid).single()
                
                if (error) throw new Error(error.message)
                
                // Format arrays for useFieldArray
                const formattedData = {
                    ...childData,
                    hobbies: childData.hobbies.map((h: string) => ({ value: h })),
                    favorite_subjects: childData.favorite_subjects.map((s: string) => ({ value: s }))
                };

                setCurrentPicturePath(childData.picture_url);
                form.reset(formattedData);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        setLoading(true);
        fetchSchoolId();
        if (mode === 'edit' && uuid) fetchChildData();
        setLoading(false)
    }, [uuid, mode, form, auth.uuid]);

    const { fields: hobbyFields, append: appendHobby, remove: removeHobby } = useFieldArray({ control: form.control, name: "hobbies" });
    const { fields: subjectFields, append: appendSubject, remove: removeSubject } = useFieldArray({ control: form.control, name: "favorite_subjects" });
    const { fields: siblingFields, append: appendSibling, remove: removeSibling } = useFieldArray({ control: form.control, name: "siblings" });

    const onSubmit = async (data: ChildFormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const pictureFile = data.picture?.[0];
            let filePath = currentPicturePath;

            // Upload a file if exists
            if (pictureFile) {
                // Create a unique file path
                filePath = `${Date.now()}-${pictureFile.name}`;

                // Upload the new picture
                const {error: uploadError} = await supabase.storage
                    .from('children-profile-picture') // Use the bucket name you created
                    .upload(filePath, pictureFile);

                if (uploadError) {
                    throw new Error(`Image Upload Failed: ${uploadError.message}`);
                }
            }

            if (mode === 'edit') {
                if (pictureFile) {
                    // Delete the old picture if exists
                    if (currentPicturePath) {
                        const {error: deleteError} = await supabase.storage
                            .from('children-profile-picture') // Use the bucket name you created
                            .remove([currentPicturePath]);

                        if (deleteError) throw deleteError.message;
                    }
                }

                const updatedData = {
                    ...data,
                    hobbies: data.hobbies.map(h => h.value),
                    favorite_subjects: data.favorite_subjects.map(s => s.value),
                    picture_url: filePath,
                    picture: undefined,
                };

                // Update the new picture path
                const {error: updateError} = await supabase.from('children')
                    .update(updatedData)
                    .eq('id', uuid);

                if (updateError) throw updateError.message;

                toast.success("Child updated successfully")
            } else {
                // Prepare the final data for the backend
                // This now includes the URL string instead of the file object
                const submissionData = {
                    ...data,
                    hobbies: data.hobbies.map(h => h.value),
                    favorite_subjects: data.favorite_subjects.map(s => s.value),
                    picture_url: filePath,
                    picture: undefined,
                };

                // 5. Submit the form data (with the URL) to your own backend
                const {error} = await supabase.from('children').insert(submissionData)
                if (error) {
                    throw new Error(error.message);
                }

                navigate('/school/children'); // Redirect to the list page on success
                toast.success("Child added successfully")
            }
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
                    <Card>
                        <CardHeader><CardTitle>Personal & School Information</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-6">
                            <FormField name="name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="date_of_birth" control={form.control} render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField name="gender" control={form.control} render={({ field }) => (<FormItem><FormLabel>Gender</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                         <FormControl className={"w-full"}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a gender" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage /></FormItem>)} />

                            <FormField name="picture" control={form.control} render={() => (
                                <FormItem>
                                    <FormLabel>Profile Picture</FormLabel>
                                    <div className="flex justify-between items-center">
                                        <FormControl><Input type="file" accept="image/*" {...form.register("picture")} /></FormControl>
                                    </div>
                                    {mode === 'edit' &&
                                        <FormDescription>Leave this field blank to keep the current picture.</FormDescription>
                                    }
                                    <FormMessage />
                                </FormItem>)} />
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
                                        <FormField name="semester" control={form.control} render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl className={"w-full"}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a semester" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="odd">Odd</SelectItem>
                                                    <SelectItem value="even">Even</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage /></FormItem>)} />
                                        <FormField name="shoes_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Shoes Size</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="shirt_size" control={form.control} render={({ field }) => (<FormItem><FormLabel>Shirt Size</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <FormField name="dreams" control={form.control} render={({ field }) => (<FormItem><FormLabel>Dreams & Aspirations</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

                                    {/* Dynamic Fields */}
                                    <div><FormLabel>Hobbies</FormLabel>{hobbyFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 pt-2"><FormField name={`hobbies.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeHobby(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}<Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendHobby({ value: "" })}>Add Hobby</Button></div>
                                    <div><FormLabel>Favorite Subjects</FormLabel>{subjectFields.map((field, index) => (<div key={field.id} className="flex items-center gap-2 pt-2"><FormField name={`favorite_subjects.${index}.value`} control={form.control} render={({ field }) => (<FormItem className="flex-1"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><Button type="button" variant="ghost" size="icon" onClick={() => removeSubject(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>))}<Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSubject({ value: "" })}>Add Subject</Button></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="family">
                            <Card>
                                <CardHeader><CardTitle>Family Information</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <FormField name="father_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Father's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="father_job" control={form.control} render={({ field }) => (<FormItem><FormLabel>Father's Job</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField name="mother_name" control={form.control} render={({ field }) => (<FormItem><FormLabel>Mother's Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <div><FormLabel>Siblings</FormLabel>{siblingFields.map((field, index) => (
                                        <Card key={field.id} className="p-4 mt-2">
                                            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4"><FormField
                                                name={`siblings.${index}.name`} control={form.control}
                                                render={({field}) => (<FormItem><FormLabel>Sibling
                                                    Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                                <FormField name={`siblings.${index}.gender`} control={form.control}
                                                           render={({field}) => (
                                                               <FormItem><FormLabel>Gender</FormLabel><Select
                                                                   onValueChange={field.onChange}
                                                                   defaultValue={field.value}>
                                                                   <FormControl><SelectTrigger><SelectValue
                                                                       placeholder="Select gender"/></SelectTrigger></FormControl><SelectContent><SelectItem
                                                                   value="Male">Male</SelectItem><SelectItem
                                                                   value="Female">Female</SelectItem></SelectContent></Select><FormMessage/></FormItem>)}/><FormField
                                                    name={`siblings.${index}.date_of_birth`} control={form.control}
                                                    render={({field}) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><Input
                                                        type="date" {...field} /></FormControl><FormMessage/></FormItem>)}/>
                                            </div>
                                            <Button type="button" variant="link" size="sm"
                                                    className="text-destructive px-0 mt-2"
                                                    onClick={() => removeSibling(index)}>Remove
                                                Sibling</Button></Card>))}<Button type="button" variant="outline"
                                                                                  size="sm" className="mt-2"
                                                                                  onClick={() => appendSibling({
                                                                                      name: "",
                                                                                      gender: "Male",
                                                                                      date_of_birth: ""
                                                                                  })}>Add Sibling</Button></div>
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

