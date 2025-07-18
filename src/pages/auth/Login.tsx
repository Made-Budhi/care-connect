"use client"

import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Link, useNavigate} from "react-router";
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form"
import {z} from "zod"
import useAuth from "@/hooks/useAuth";
import {useEffect} from "react";
import LoadingSpinner from "@/components/loading-spinner.tsx";
import {axiosPublic} from "@/lib/axios.ts";
import {toast} from "sonner";

const formSchema = z.object({
    email: z.string().email(
        {message: "Invalid email address."},
    ),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters."
    })
})

export function Login({className, ...props}: React.ComponentPropsWithoutRef<"form">) {
    const { auth, setAuth } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.accessToken) {
            // Render dashboard based on a user role
            switch (auth.role) {
                case 'sponsor':
                    navigate('/sponsor/children');
                    break;
                case 'stuart':
                    navigate('/stuart/funding');
                    break;
                case 'school':
                    navigate('/school/children');
                    break;
                case 'admin':
                    navigate('/admin/children');
                    break;
                default:
                    // If role is not recognized, redirect to unauthorized page
                    navigate('/unauthorized');
            }
        }
    }, [auth, navigate]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const {isSubmitting} = form.formState;

    const onSubmit = async (value: z.infer<typeof formSchema>) => {
        try {
            const response = await axiosPublic.post(
                `/auth/v1/login`,
                value,
            )

            const { accessToken, name, email, uuid, role } = response.data;
            setAuth({ accessToken, name, email, uuid, role })

        } catch (error) {
            const toastPopUp = () => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                toast.error(`${error?.response?.data.message}`)
            }

            toastPopUp()
        }

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn("flex flex-col gap-6", className)} {...props}>
                <div className="flex flex-col items-start gap-2 text-center mb-4">
                    <h1 className="text-2xl font-bold">Login to your account</h1>

                    <p className="text-balance text-sm text-foreground">
                        Don't have an account? <Link to={"/register"} className={"text-cc-primary underline-offset-4 hover:underline"}>Sign Up</Link>
                    </p>
                </div>

                <div className="grid gap-6">
                    <FormField control={form.control}
                               name="email"
                               render={({ field }) => (

                        <FormItem className="grid gap-2">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} autoComplete={"email"} placeholder={"user@example.com"}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )} />

                    <FormField control={form.control}
                               name={"password"}
                               render={({ field }) => (

                        <FormItem className="grid gap-2">
                            <div className="flex items-center">
                                <FormLabel>Password</FormLabel>
                                <Link to={"/forgot-password"} className="ml-auto text-sm underline-offset-4 hover:underline text-cc-primary">
                                    Forgot your password?
                                </Link>
                            </div>
                            <FormControl>
                                <Input type={"password"} {...field} autoComplete={"current-password"} placeholder={"••••••••"}/>
                            </FormControl>
                            <FormMessage />
                        </FormItem>

                    )} />

                    <Button variant={"ccbutton"} type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? <LoadingSpinner /> : "Login"}
                    </Button>

                    <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                        <span className="relative z-10 bg-background px-2 text-muted-foreground">
                        Or continue with
                        </span>
                    </div>
                    <Button variant="outline" className="w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 48 48">
                            <path fill="#FFC107"
                                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00"
                                  d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50"
                                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2"
                                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                        </svg>
                        Continue with Google
                    </Button>
                </div>
            </form>
        </Form>
    )
}
