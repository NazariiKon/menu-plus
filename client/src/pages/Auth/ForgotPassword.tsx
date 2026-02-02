import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

interface ForgotPasswordFormData {
    email: string;
}


export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth('signin');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const form = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: '',
        },
    });

    const handleSubmit = async (data: ForgotPasswordFormData) => {
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            await forgotPassword(data.email);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <CardTitle>Check your email</CardTitle>
                        <CardDescription>
                            We've sent a password reset link to your email address.
                            <br />
                            Click the link to set your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
            <Card className="w-full max-w-[500px]">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 mt-4 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle>Forgot Password?</CardTitle>
                    <CardDescription>
                        Enter your email address and we'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                {...form.register('email')}
                                className="w-full"
                                disabled={loading}
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive px-2">
                                    {form.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            variant={"mystyle"}
                            disabled={loading || !form.formState.isValid}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Reset Link
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground pt-4 mb-4">
                        <button
                            type="button"
                            className="text-primary hover:underline font-medium"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
