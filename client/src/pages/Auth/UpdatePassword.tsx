import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { z } from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const updatePasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

interface UpdatePasswordFormData {
    password: string;
}

export default function UpdatePasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const { updateUserPassword } = useAuth('signin');

    const form = useForm<UpdatePasswordFormData>({
        resolver: zodResolver(updatePasswordSchema),
        defaultValues: {
            password: '',
        },
    });

    useEffect(() => {
        const handleRecovery = async () => {
            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                const hash = searchParams.get('hash');
                const type = searchParams.get('type');

                if (hash && type === 'recovery') {
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token_hash: hash,
                        type: 'recovery' as const,
                    });

                    if (verifyError) {
                        setError('Invalid or expired reset link');
                    }
                } else {
                    setError('Invalid reset link');
                }
            }
        };

        handleRecovery();
    }, [searchParams]);

    const handleSubmit = async (data: UpdatePasswordFormData) => {
        setLoading(true);
        setError('');

        try {
            await updateUserPassword(data.password);
            setSuccess(true);
            form.reset();
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
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
                        <CardTitle>Password Updated!</CardTitle>
                        <CardDescription>
                            Your password has been successfully updated.
                            <br />
                            You can now log in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                        <Button className="w-full" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <CardTitle>New Password</CardTitle>
                    <CardDescription>
                        Enter your new password. This link will expire soon.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                {...form.register('password')}
                                className="w-full"
                                disabled={loading}
                            />
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive px-2">
                                    {form.formState.errors.password.message}
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
                            disabled={loading || !form.formState.isValid}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Update Password
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground pt-4">
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
