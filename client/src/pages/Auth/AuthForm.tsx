import { ArrowRight, Loader2, Mail, Lock, User } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormRootError } from "@/components/ui/form-root-error";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function AuthForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const {
        form,
        isSignup,
        loading,
        googleLoading,
        onSubmit,
        signInWithGoogle,
        toggleMode
    } = useAuth();

    useEffect(() => {
        if (location.state?.demo) {
            form.reset({
                email: location.state.email,
                password: location.state.password || '',
                name: location.state.name || ''
            });
        }
    }, [location.state, form]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-8">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-3">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                        Menu+
                    </CardTitle>
                    <CardDescription>
                        {isSignup
                            ? "Create your digital QR menu in seconds. Sign up to get started."
                            : "Welcome back! Sign in to your account."
                        }
                    </CardDescription>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 rounded-lg border-slate-200 bg-white hover:bg-slate-50"
                        onClick={signInWithGoogle}
                        disabled={googleLoading || loading}
                    >
                        {googleLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Signing in with Google...
                            </>
                        ) : (
                            <>
                                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3.1l3 2.3C20.4 18.1 21.3 16.2 21.3 14c0-1-.1-1.7-.3-2.5H12z" />
                                    <path fill="#34A853" d="M6.6 14.3l-.8.6-2.4 1.9C4.6 19.4 8.1 21 12 21c2.7 0 4.9-.9 6.6-2.5l-3-2.3c-.8.6-1.9 1.1-3.6 1.1-2.8 0-5.1-1.9-5.9-4.5z" />
                                    <path fill="#4A90E2" d="M3.4 6.8C2.5 8.5 2.1 10.2 2.1 12s.4 3.5 1.3 5.2l3.2-2.5C6.2 13.9 6 13 6 12s.2-1.9.6-2.7z" />
                                    <path fill="#FBBC05" d="M12 5.5c1.5 0 2.8.5 3.8 1.4l2.8-2.8C16.9 2.5 14.7 1.7 12 1.7 8.1 1.7 4.6 3.3 3.4 6.8l3.2 2.5C6.9 7.4 9.2 5.5 12 5.5z" />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </Button>

                    <div className="flex items-center space-x-2 py-2">
                        <Separator className="flex-1" />
                        <span className="text-xs text-slate-400 px-2">or</span>
                        <Separator className="flex-1" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {isSignup && (
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input className="pl-10" placeholder="Alex" {...field} autoComplete={isSignup ? "name" : "username name"} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input className="pl-10" placeholder="cafe@example.com" {...field} autoComplete={isSignup ? "email" : "username email"} />
                                            </div>
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
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input type="password" className="pl-10" placeholder="••••••••" {...field} autoComplete={isSignup ? "new-password" : "current-password"} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {!isSignup && (
                                <Button
                                    type="button"
                                    variant="link"
                                    className="w-full text-slate-500 text-sm hover:text-destructive/80 p-0 h-auto justify-start"
                                    onClick={() => navigate('/forgot-password')}
                                >
                                    Forgot your password?
                                </Button>
                            )}

                            <FormRootError />

                            <Button type="submit" className="w-full rounded-lg" disabled={loading || googleLoading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isSignup ? "Creating account..." : "Signing in..."}
                                    </>
                                ) : (
                                    <>
                                        {isSignup ? "Sign Up" : "Sign In"}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>

                <CardFooter className="px-6 pb-6 pt-0">
                    <div className="w-full text-center text-sm text-slate-500">
                        {isSignup ? "Already have an account? " : "Don't have an account? "}
                        <button type="button" onClick={toggleMode} className="text-blue-600 hover:underline font-medium">
                            {isSignup ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
