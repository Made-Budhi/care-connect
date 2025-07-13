"use client"

import {cn} from "@/lib/utils"
import {Button, buttonVariants} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Link, useNavigate} from "react-router";
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {z} from "zod"
import useAuth from "@/hooks/useAuth";
import {useEffect} from "react";
import {axiosPublic} from "@/lib/axios.ts";

const formSchema = z.object({
    email: z.string().email(
        {message: "Invalid email address."},
    )
})

export default function ForgotPassword({className, ...props}: React.ComponentPropsWithoutRef<"form">) {
    const { auth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.accessToken) {
            // Redirect to dashboard if authenticated
            navigate("/dashboard", {replace: true})
        }
        document.title = 'Bali School Kids | Forgot Password';
    }, [auth, navigate])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        }
    })

    const {isSubmitting} = form.formState;

    const onSubmit = async (value: z.infer<typeof formSchema>) => {
        try {
            await axiosPublic.post("/auth/v1/forgot-password", value)
        } catch (error) {
            console.error(error)
            alert('Something went wrong. Try again.')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
                <div className="flex flex-col items-start gap-2 mb-4">
                    <h1 className="text-2xl font-bold">Forgot Password</h1>

                    <p className="text-balance text-sm text-foreground">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <div className="grid gap-3">
                    <FormField control={form.control}
                               name="email"
                               render={({ field }) => (

                                   <FormItem className="grid gap-2">
                                       <FormLabel>Email</FormLabel>
                                       <FormControl>
                                           <Input {...field} autoComplete={"email"} placeholder={"user@example.com"} />
                                       </FormControl>
                                       <FormMessage />
                                   </FormItem>

                               )} />

                    <Button variant={"ccbutton"} type="submit" className="w-full mt-10" disabled={isSubmitting}>
                        Send Reset Link
                    </Button>

                    <Link to={"/login"} className={buttonVariants({variant: "outline"})}>Back to Login</Link>
                </div>
            </form>
        </Form>
    )
}
