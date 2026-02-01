import { ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSignup } from "@/hooks/useSignup";
import { useNavigate } from "react-router-dom";
import { FormRootError } from "@/components/ui/form-root-error";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export default function SignUp() {
    const navigate = useNavigate();
    const { form, loading, onSubmit } = useSignup();
    const { googleLoading, signUpWithGoogle } = useGoogleAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-3">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                        Menu+
                    </CardTitle>
                    <CardDescription className="text-slate-500 space-y-3">
                        <p>Create your digital QR menu in seconds. Sign up to get started.</p>
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full flex items-center justify-center gap-2 rounded-lg border-slate-200 bg-white hover:bg-slate-50"
                            onClick={signUpWithGoogle}
                            disabled={googleLoading || loading}
                        >
                            {googleLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in with Google...
                                </>
                            ) : (
                                <>
                                    <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fill="#EA4335"
                                            d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3.1l3 2.3C20.4 18.1 21.3 16.2 21.3 14c0-1-.1-1.7-.3-2.5H12z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M6.6 14.3l-.8.6-2.4 1.9C4.6 19.4 8.1 21 12 21c2.7 0 4.9-.9 6.6-2.5l-3-2.3c-.8.6-1.9 1.1-3.6 1.1-2.8 0-5.1-1.9-5.9-4.5z"
                                        />
                                        <path
                                            fill="#4A90E2"
                                            d="M3.4 6.8C2.5 8.5 2.1 10.2 2.1 12s.4 3.5 1.3 5.2l3.2-2.5C6.2 13.9 6 13 6 12s.2-1.9.6-2.7z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M12 5.5c1.5 0 2.8.5 3.8 1.4l2.8-2.8C16.9 2.5 14.7 1.7 12 1.7 8.1 1.7 4.6 3.3 3.4 6.8l3.2 2.5C6.9 7.4 9.2 5.5 12 5.5z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-slate-400">
                            Or use your email and password below.
                        </p>
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Alex" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
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

                            <Button
                                type="submit"
                                className="w-full rounded-lg"
                                disabled={loading || googleLoading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating your account...
                                    </>
                                ) : (
                                    <>
                                        Sign Up
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="text-center text-sm text-slate-500 pt-4 border-t">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:underline font-medium"
                        >
                            Sign in
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
