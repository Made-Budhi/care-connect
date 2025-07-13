"use client"

import {z} from "zod";
import { cn } from "@/lib/utils"
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {toast} from "sonner";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {Textarea} from "@/components/ui/textarea.tsx";
import {supabase} from "@/lib/supabaseClient.ts";

// Zod schema for form validation based on the School entity
const schoolSchema = z.object({
    name: z.string().min(3, "School name must be at least 3 characters long."),
    region: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    manager_id: z.string().optional().nullable(),
    latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90.").max(90, "Latitude must be between -90 and 90."),
    longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180.").max(180, "Longitude must be between -180 and 180."),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

function AddEditSchool({ mode }: { mode: "add" | "edit" }) {
    const { uuid } = useParams<{ uuid?: string }>();
    const navigate = useNavigate();

    // This is for the combo box for selecting the school's manager
    const [open, setOpen] = useState(false)
    const [selectedManagerId, setSelectedManagerId] = useState("")
    const [selectedManagerName, setSelectedManagerName] = useState("")
    const [currentManagerId, setCurrentManagerId] = useState(null)
    const [users, setUsers] = useState<{id: string; name: string}[]>([])

    const [loading, setLoading] = useState<boolean>(mode === 'edit');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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
            manager_id: "",
            latitude: 0,
            longitude: 0,
        }
    });

    useEffect(() => {
        setLoading(true);
        setError(null);

        // Fetch the list of users
        // to populate the combo box
        const fetchUsers = async () => {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('id, name')
                    .eq('role', 'sponsor');

                if (error) {
                    throw error;
                }

                // Populate the form with the fetched data
                if (data) {
                    setUsers(data);
                }
            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        const fetchSchoolData = async () => {
            try {
                const { data, error } = await supabase
                    .from('schools')
                    .select('*')
                    .eq('id', uuid)
                    .single();

                if (error) {
                    throw error;
                }

                // Populate the form with the fetched data
                if (data) {
                    if (data.manager_id) {
                        const { data: currentManager, error } = await supabase.from('profiles').select('id, name').eq('id', data.manager_id).single();
                        if (error) throw error

                        setSelectedManagerId(currentManager.id)
                        setSelectedManagerName(currentManager.name)
                        setCurrentManagerId(currentManager.id)

                        form.setValue("manager_id", currentManager.id, { shouldValidate: true });
                        setUsers(prevState => [...prevState, {id: currentManager.id, name: currentManager.name}])
                    }

                    form.reset(data);
                }

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
        if (mode === 'edit' && uuid) fetchSchoolData();

    }, [uuid, mode, form]);

    const onSubmit = async (formData: SchoolFormValues) => {
        setIsSubmitting(true);
        setError(null);

        const submissionData = {
            ...formData,
            manager_id: formData.manager_id || null,
            region: formData.region || null,
            address: formData.address || null,
        };

        try {
            if (mode === 'edit') {
                // The whole idea is to change the current manager's role to 'sponsor' and the selected manager's role to 'school'.

                if (currentManagerId !== selectedManagerId) {
                    if (currentManagerId) {
                        // Change the current manager's role to 'sponsor'
                        const { error: functionError } = await supabase.functions.invoke('update-user-role', {
                            // The 'body' is what becomes req.json() inside your Edge Function
                            body: {
                                userId: currentManagerId,
                                newRole: 'sponsor'
                            },
                        });

                        if (functionError) throw functionError;
                    }

                    if (selectedManagerId) {
                        // Change the selected manager's role to 'school'
                        const { error: functionError2 } = await supabase.functions.invoke('update-user-role', {
                            // The 'body' is what becomes req.json() inside your Edge Function
                            body: {
                                userId: selectedManagerId,
                                newRole: 'school'
                            },
                        });

                        if (functionError2) throw functionError2;
                    }
                }

                const { error } = await supabase
                    .from('schools')
                    .update(submissionData)
                    .eq('id', uuid);

                if (error) throw error;

                toast.success("School updated successfully.")
            } else {
                // Adding a new School
                const { error: insertError } = await supabase
                    .from('schools')
                    .insert([submissionData]);

                if (insertError) throw insertError;

                if (selectedManagerId) {
                    // Change user_metadata.role to 'school' inside auth.users and public.profiles
                    const { error: functionError } = await supabase.functions.invoke('update-user-role', {
                        // The 'body' is what becomes req.json() inside your Edge Function
                        body: {
                            userId: selectedManagerId,
                            newRole: 'school'
                        },
                    });

                    if (functionError) throw functionError;
                }

                toast.success("School added successfully.")
            }

            navigate('/admin/schools');
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
                            <CardTitle>School Information</CardTitle>
                            <CardDescription>
                                {mode === 'edit' ? 'Update the details for this school.' : 'Fill out the form to add a new school.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField name="name" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>School Name</FormLabel><FormControl><Input placeholder="e.g., SDN Menteng 01 Pagi" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="region" control={form.control} render={() => (
                                    <FormItem><FormLabel>Region</FormLabel>
                                    <FormControl><Input placeholder="e.g., Karangasem"  /></FormControl><FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField name="address" control={form.control} render={() => (<FormItem><FormLabel>Full Address</FormLabel><FormControl><Textarea placeholder="Enter the full school address" className="min-h-[100px]" /></FormControl><FormMessage /></FormItem>)} />

                            <div className="grid md:grid-cols-2 gap-6">
                                <FormField name="latitude" control={form.control} render={() => (<FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., -6.1954" /></FormControl><FormMessage /></FormItem>)} />
                                <FormField name="longitude" control={form.control} render={() => (<FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" placeholder="e.g., 106.8272" /></FormControl><FormMessage /></FormItem>)} />
                            </div>

                            {/*Combo box*/}
                            <FormField
                                control={form.control}
                                name="manager_id"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>School Manager</FormLabel>

                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className="justify-between opacity-50 overflow-ellipsis w-full"
                                                >
                                                    {selectedManagerName
                                                        ? selectedManagerName
                                                        : "Select user to manage this school"}
                                                    <ChevronDown />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="p-0 w-full">
                                                <Command>
                                                    <CommandInput placeholder="Search user..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No user found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {users.map((user) => (
                                                                <CommandItem
                                                                    key={user.id}
                                                                    value={user.id}
                                                                    onSelect={() => {
                                                                        setSelectedManagerId(user.id)
                                                                        setSelectedManagerName(user.name)
                                                                        form.setValue("manager_id", user.id, { shouldValidate: true });
                                                                        setOpen(false)
                                                                    }}
                                                                >
                                                                    {user.name}
                                                                    <Check
                                                                        className={cn(
                                                                            "ml-auto",
                                                                            selectedManagerId === user.id ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>

                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
