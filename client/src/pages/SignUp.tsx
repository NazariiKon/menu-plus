import { ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/useSignup";
import { useNavigate } from 'react-router-dom';
import { FormRootError } from "@/components/ui/form-root-error";

export default function SignUp() {
    const navigate = useNavigate();
    const { form, loading, onSubmit } = useSignup();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                        Menu+
                    </CardTitle>
                    <CardDescription className="text-slate-500">
                        Create your digital QR menu in seconds. Sign up to get started.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cafe@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormRootError />

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating your account..
                                    </>
                                ) : (
                                    <>
                                        Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                            { }
                        </form>
                    </Form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t">
                        Already have an account?{" "}
                        <button onClick={() => navigate("/login")} className="text-blue-600 hover:underline font-medium">
                            Sign in
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
