"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useParams} from "react-router";
import useAxiosPrivate from "@/hooks/useInterceptor.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Separator} from "@/components/ui/separator.tsx";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {cn} from "@/lib/utils.ts";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";

const title = "Foster Child Detail"
const breadcrumbs = [
    {
        name: "Foster Child List",
        url: "/sponsor/children",
    },
    {
        name: "Detail"
    }
]

interface Child {
    uuid: string;

    // Personal Identity
    picture: string;
    name: string;
    schoolName: string;
    dateOfBirth: string;
    gender: string;

    // Academic data
    grade: string;
    semester: string;
    shoesSize: string;
    shirtSize: string;
    favoriteSubjects: string[];
    hobbies: string[];
    dreams: string;

    // Family data
    fatherName: string;
    fatherJob: string;
    motherName: string;
    siblings: { name: string, gender: string, dateOfBirth: string }[];
}

const childSchema = z.object({
    name: z.string().min(1),
    siblings: z.array(z.object({
        name: z.string(),
        gender: z.string(),
        dateOfBirth: z.string()
    })),
    favoriteSubjects: z.array(z.string()),
    hobbies: z.array(z.string()),
    schoolName: z.string(),
    dateOfBirth: z.string(),
    gender: z.enum(["Male", "Female"]),
    grade: z.string(),
    semester: z.string(),
    shoesSize: z.string(),
    shirtSize: z.string(),
    fatherName: z.string(),
    fatherJob: z.string(),
    motherName: z.string(),
    dreams: z.string(),
    picture: z.string().url()
});

type ChildFormValues = z.infer<typeof childSchema>

function ChildDetail({mode}: {mode: "view" | "edit"}) {
    const [data, setData] = useState<Child>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const axiosPrivate = useAxiosPrivate()

    const isDisabled = mode === "view";
    const {uuid} = useParams();

    useEffect(() => {
        const fetchChildren = async () => {
            setLoading(true);

            try {
                const response = await axiosPrivate.get(`/v1/children/${uuid}`);
                setData(response.data);
                Object.keys(response.data).forEach((key) => {
                    setValue(key as keyof ChildFormValues, response.data[key]);
                })
            } catch (error) {
                console.error(error);
                setError("Failed to load data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChildren()
    }, []);

    const form = useForm<ChildFormValues>({
        resolver: zodResolver(childSchema),
        defaultValues: {
            name: "",
            schoolName: "",
            dateOfBirth: "",
            gender: undefined,
            grade: "",
            semester: "",
            shoesSize: "",
            shirtSize: "",
            fatherName: "",
            fatherJob: "",
            motherName: "",
            siblings: [],
            favoriteSubjects: [],
            hobbies: [],
            dreams: "",
            picture: "",
        }
    })

    const {
        handleSubmit,
        setValue,
        control,
    } = form;

    // Dynamic input field
    const {
        fields: hobbyFields,
        append: appendHobby,
        remove: removeHobby,

        // TODO:    No actual error is happening but typescript throws an error somehow.
        //          Best to take action regarding this matter in the future.
        //          To display the error, delete comments below.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
    } = useFieldArray<ChildFormValues, "hobbies", "id">({ control, name: "hobbies"});

    const {
        fields: siblingFields,
        append: appendSibling,
        remove: removeSibling,
    } = useFieldArray<ChildFormValues, "siblings", "id">({ control, name: "siblings" });

    const {
        fields: subjectFields,
        append: appendSubject,
        remove: removeSubject,

        // TODO:    No actual error is happening but typescript throws an error somehow.
        //          Best to take action regarding this matter in the future.
        //          To display the error, delete comments below.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
    } = useFieldArray<ChildFormValues, "favoriteSubjects", "id">({ control, name: "favoriteSubjects" });


    const onSubmit = async (data: ChildFormValues) => {
        if (mode === "edit") {
            await axiosPrivate.put(`/api/children/${uuid}`, data);
        }
    };

    return (
        <div className={"space-y-8"}>
            <PageTitle title={title} breadcrumbs={breadcrumbs} />

            <Card>
                {error && <div>{error}</div>}

                {loading ? (
                        <div className={"my-10 mx-auto"}>
                            <LoadingSpinner />
                        </div>
                    ) :
                    <>
                        <CardHeader>
                            <CardTitle>{data?.name}'s Detail</CardTitle>
                        </CardHeader>
                        <Separator />
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6 lg:flex lg:gap-6")}>
                                    {/*Personal data section*/}
                                    <section id="personal-data" className={"space-y-6 basis-1/3"}>
                                        {/*Picture container*/}
                                        <div className="w-full sm:w-1/2 bg-muted rounded-sm overflow-hidden">
                                            <img src={data?.picture}
                                                 alt={data?.name}
                                                 onError={(e) => {
                                                     (e.currentTarget.src = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80")
                                                 }}
                                                 className={"object-cover"}/>
                                        </div>

                                        <div className={"flex gap-4"}>
                                            <FormField control={control} name="name" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={control} name="gender" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Gender</FormLabel>
                                                    <Select onValueChange={field.onChange} name={"gender"} defaultValue={field.value} disabled={isDisabled}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select a gender" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="Male">Male</SelectItem>
                                                            <SelectItem value="Female">Female</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>

                                        <FormField control={control} name="schoolName" render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel>School</FormLabel>
                                                <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />


                                        <FormField control={control} name="dateOfBirth" render={({ field }) => (
                                            <FormItem className="grid gap-2">
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl><Input {...field} autoComplete={"bday-day"} disabled={isDisabled}/></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </section>

                                    <Tabs defaultValue="academic" className={"basis-2/3"}>
                                        <TabsList>
                                            <TabsTrigger value="academic">Academic</TabsTrigger>
                                            <TabsTrigger value="relatives">Relatives</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="academic">
                                            <div className={"flex gap-3"}>
                                                <FormField control={control} name="grade" render={({ field }) => (
                                                    <FormItem className="grid gap-2">
                                                        <FormLabel>Grade</FormLabel>
                                                        <Select onValueChange={field.onChange} name="grade" defaultValue={field.value} disabled={isDisabled}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select grade" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="1st">1st</SelectItem>
                                                                <SelectItem value="2nd">2nd</SelectItem>
                                                                <SelectItem value="3rd">3rd</SelectItem>
                                                                <SelectItem value="4th">4th</SelectItem>
                                                                <SelectItem value="5th">5th</SelectItem>
                                                                <SelectItem value="6th">6th</SelectItem>
                                                                <SelectItem value="7th">7th</SelectItem>
                                                                <SelectItem value="8th">8th</SelectItem>
                                                                <SelectItem value="9th">9th</SelectItem>
                                                                <SelectItem value="10th">10th</SelectItem>
                                                                <SelectItem value="11th">11th</SelectItem>
                                                                <SelectItem value="12th">12th</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />

                                                <FormField control={control} name="semester" render={({ field }) => (
                                                    <FormItem className="grid gap-2">
                                                        <FormLabel>Semester</FormLabel>
                                                        <Select onValueChange={field.onChange} name="semester" defaultValue={field.value} disabled={isDisabled}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Semester" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="Odd">Odd</SelectItem>
                                                                <SelectItem value="Even">Even</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>

                                            <FormField control={control} name="shoesSize" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Shoes Size (EU)</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={control} name="shirtSize" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Shirt Size</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <div id={"hobbies"}>
                                                <p>Hobbies</p>
                                                {hobbyFields.map((field, index) => (
                                                    <div key={field.id}>
                                                        <FormField control={control} name={`hobbies.${index}`} render={({ field }) => (
                                                            <FormItem className="grid gap-2">
                                                                <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />

                                                        {mode === "edit" && <Button type="button" onClick={() => removeHobby(index)} className="col-span-3">Remove</Button>}
                                                    </div>
                                                ))}

                                                {mode === "edit" && <Button type="button" onClick={() => appendHobby("")}>Add Hobby</Button>}
                                            </div>

                                            <div id={"favorite-subjects"}>
                                                <p>Favorite Subjects</p>
                                                {subjectFields.map((field, index) => (
                                                    <div key={field.id}>
                                                        <FormField control={control} name={`favoriteSubjects.${index}`} render={({ field }) => (
                                                            <FormItem className="grid gap-2">
                                                                <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />

                                                        {mode === "edit" && <Button type="button" onClick={() => removeSubject(index)} className="col-span-3">Remove</Button>}
                                                    </div>
                                                ))}

                                                {mode === "edit" && <Button type="button" onClick={() => appendSubject("")}>Add Subject</Button>}
                                            </div>

                                            <FormField control={control} name="dreams" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Dreams</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                        </TabsContent>

                                        <TabsContent value="relatives">
                                            <FormField control={control} name="fatherName" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Father's Name</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={control} name="fatherJob" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Father's Job</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <FormField control={control} name="motherName" render={({ field }) => (
                                                <FormItem className="grid gap-2">
                                                    <FormLabel>Mother's Name</FormLabel>
                                                    <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />

                                            <div id={"siblings"}>
                                                <p>Siblings</p>
                                                {siblingFields.map((field, index) => (
                                                    <div key={field.id}>
                                                        <FormField control={control} name={`siblings.${index}.name`} render={({ field }) => (
                                                            <FormItem className="grid gap-2">
                                                                <FormLabel>Name</FormLabel>
                                                                <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />

                                                        <FormField control={control} name={`siblings.${index}.gender`} render={({ field }) => (
                                                            <FormItem className="grid gap-2">
                                                                <FormLabel>Gender</FormLabel>
                                                                <Select onValueChange={field.onChange} name={"gender"} defaultValue={field.value} disabled={isDisabled}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Select a gender" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Male">Male</SelectItem>
                                                                        <SelectItem value="Female">Female</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />

                                                        <FormField control={control} name={`siblings.${index}.dateOfBirth`} render={({ field }) => (
                                                            <FormItem className="grid gap-2">
                                                                <FormLabel>Date of Birth</FormLabel>
                                                                <FormControl><Input {...field} autoComplete={"name"} disabled={isDisabled}/></FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )} />

                                                        {mode === "edit" && <Button type="button" onClick={() => removeSibling(index)} className="col-span-3">Remove</Button>}
                                                    </div>
                                                ))}

                                                {mode === "edit" && <Button type="button" onClick={() => appendSibling({ name: "", gender: "", dateOfBirth: "" })}>Add Sibling</Button>}
                                            </div>
                                        </TabsContent>

                                        {mode === "edit" && <Button type="submit" className="mt-4">Save</Button>}
                                    </Tabs>
                                </form>
                            </Form>
                        </CardContent>
                    </>
                }
            </Card>

        </div>
    )
}

export default ChildDetail;