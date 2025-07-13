"use client"

import { z } from "zod";
import PageTitle from "@/components/page-title.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
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
import { Check, ChevronsUpDown } from "lucide-react"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {supabase} from "@/lib/supabaseClient.ts";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import useAuth from "@/hooks/useAuth.tsx";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Zod schema for form validation
const matchSchema = z.object({
    sponsor_id: z.string().uuid("You must select a valid sponsor."),
    matched_child_id: z.string().uuid("You must select a valid child."),
    startDate: z.date({ required_error: "A start date is required." }),
    endDate: z.date({ required_error: "An end date is required." }),
}).refine(data => data.endDate > data.startDate, {
    message: "End date must be after the start date.",
    path: ["endDate"],
});

type MatchFormValues = z.infer<typeof matchSchema>;
type Duration = '1y' | '2y' | '3y' | '4y' | '5y' | '6y' | 'custom';

interface SelectItem {
    uuid: string;
    name: string;
}

function MatchSponsorshipPage() {
    const [sponsors, setSponsors] = useState<SelectItem[]>([]);
    const [children, setChildren] = useState<SelectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [duration, setDuration] = useState<Duration>('1y');

    const title = "Match Sponsor to Child";
    const breadcrumbs = [ { name: "Funding List", url: "/stuart/funding" }, { name: "Match" } ];

    const form = useForm<MatchFormValues>({
        resolver: zodResolver(matchSchema),
    });

    const startDate = form.watch('startDate');
    useEffect(() => {
        if (startDate && duration !== 'custom') {
            const yearsToAdd = parseInt(duration.replace('y', ''));
            const newEndDate = new Date(startDate);
            newEndDate.setFullYear(newEndDate.getFullYear() + yearsToAdd);
            form.setValue('endDate', newEndDate, { shouldValidate: true });
        }
    }, [startDate, duration, form]);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [sponsorsRes, childrenRes] = await Promise.all([
                    supabase.from('profiles').select('id, name').eq('role', 'sponsor'),
                    supabase.from('children').select('id, name').eq('funding_status', 'not_funded')
                ]);

                if (sponsorsRes.error) throw sponsorsRes.error;
                if (childrenRes.error) throw childrenRes.error;

                setSponsors(sponsorsRes.data.map(s => ({ uuid: s.id, name: s.name })));
                setChildren(childrenRes.data.map(c => ({ uuid: c.id, name: c.name })));

            } catch (error) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                setError(error.message || "Failed to load necessary data.");
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const onSubmit = async (data: MatchFormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            const submissionData = {
                sponsor_id: data.sponsor_id,
                matched_child_id: data.matched_child_id,
                status: 'approved',
                start_date: data.startDate.toISOString(),
                end_date: data.endDate.toISOString(),
                approved_by_id: auth.uuid,
            };

            const { error: insertError } = await supabase
                .from('funding_submissions')
                .insert([submissionData]);

            if (insertError) throw insertError;

            const { error: updateChildError } = await supabase
                .from('children')
                .update({ funding_status: 'funded' })
                .eq('id', data.matched_child_id);

            if (updateChildError) {
                throw new Error("Sponsorship record was created, but failed to update the child's status. Please contact support.");
            }

            toast.success("Sponsorship matched successfully!");
            navigate('/stuart/funding');

        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setError(error.message || "An error occurred while creating the match.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const Combobox = ({ name, label, placeholder, items }: { name: "sponsor_id" | "matched_child_id", label: string, placeholder: string, items: SelectItem[] }) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{label}</FormLabel>
                    <Popover><PopoverTrigger asChild><FormControl>
                        <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                            {field.value ? items.find(item => item.uuid === field.value)?.name : placeholder}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </FormControl></PopoverTrigger><PopoverContent className="p-0 w-[--radix-popover-trigger-width]"><Command>
                        <CommandInput placeholder={`Search ${label.toLowerCase()}...`} />
                        <CommandList><CommandEmpty>No results found.</CommandEmpty><CommandGroup>
                            {items.map((item) => (
                                <CommandItem value={item.name} key={item.uuid} onSelect={() => form.setValue(name, item.uuid)}>
                                    <Check className={cn("mr-2 h-4 w-4", item.uuid === field.value ? "opacity-100" : "opacity-0")} />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup></CommandList>
                    </Command></PopoverContent></Popover><FormMessage />
                </FormItem>
            )}
        />
    );

    if (loading) return <div className="flex h-64 w-full items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="space-y-8">
            <PageTitle title={title} breadcrumbs={breadcrumbs} />
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Sponsorship</CardTitle>
                    <CardDescription>Select a sponsor and an available child to create a new sponsorship period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <Combobox name="sponsor_id" label="Sponsor" placeholder="Select a sponsor" items={sponsors} />
                            <Combobox name="matched_child_id" label="Child" placeholder="Select an unfunded child" items={children} />

                            <Separator />

                            <div className="space-y-2">
                                <FormLabel>Sponsorship Duration</FormLabel>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Button type="button" size="sm" variant={duration === '1y' ? 'default' : 'outline'} onClick={() => setDuration('1y')}>1 Year</Button>
                                    <Button type="button" size="sm" variant={duration === '2y' ? 'default' : 'outline'} onClick={() => setDuration('2y')}>2 Years</Button>
                                    <Button type="button" size="sm" variant={duration === '3y' ? 'default' : 'outline'} onClick={() => setDuration('3y')}>3 Years</Button>
                                    <Button type="button" size="sm" variant={duration === '4y' ? 'default' : 'outline'} onClick={() => setDuration('4y')}>4 Years</Button>
                                    <Button type="button" size="sm" variant={duration === '5y' ? 'default' : 'outline'} onClick={() => setDuration('5y')}>5 Years</Button>
                                    <Button type="button" size="sm" variant={duration === '6y' ? 'default' : 'outline'} onClick={() => setDuration('6y')}>6 Years</Button>
                                    <Button type="button" size="sm" variant={duration === 'custom' ? 'default' : 'outline'} onClick={() => setDuration('custom')}>Custom</Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* --- REFACTORED: Using basic HTML date input --- */}
                                <FormField control={form.control} name="startDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Sponsorship Start Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(e.target.valueAsDate)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={form.control} name="endDate" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Sponsorship End Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                disabled={duration !== 'custom'}
                                                value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                                onChange={(e) => field.onChange(e.target.valueAsDate)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                            </div>

                            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <LoadingSpinner />}
                                    Create Match
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

export default MatchSponsorshipPage;
