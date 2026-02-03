import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import { useSelector } from 'react-redux';
import { supabase } from '@/lib/supabase';
import type { RootState } from '@/store/store';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const profileSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

interface ProfileFormData {
    name: string;
    email: string;
}

const PasswordSchema = z.object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof PasswordSchema>;

export default function Profile() {
    const user = useSelector((state: RootState) => state.user.currentUser);
    const { updateUserPassword } = useAuth("signin");

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(PasswordSchema),
    });

    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (user) {
            profileForm.reset({
                name: user.user_metadata?.full_name || '',
                email: user.email || '',
            });
        }
    }, [user, profileForm]);

    const handleProfileSave = async (data: ProfileFormData) => {
        setProfileLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { full_name: data.name },
            });
            if (error) throw error;
            else toast.success("Account updated successfully", {
                description: "Your profile information has been saved. Changes will be reflected immediately.",
                position: "top-center"
            })
        } catch (error: any) {
            console.error('Profile update failed', error.message);
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        const values = passwordForm.getValues();
        setPasswordLoading(true);
        setPasswordError('');
        setPasswordSuccess(false);

        try {
            await updateUserPassword(values.newPassword);
            setPasswordSuccess(true);
            passwordForm.reset();
        } catch (error: any) {
            setPasswordError(error.message);
        } finally {
            setPasswordLoading(false);
        }
    };


    if (!isClient || !user) {
        return <p>You doesnt exist</p>
    }

    return (
        <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-12 text-center md:text-left">
                    Profile
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <Card>
                        <CardHeader className='mt-5'>
                            <CardTitle>Account Information</CardTitle>
                            <CardDescription>Update your profile details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        {...profileForm.register('name')}
                                        className="w-full"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...profileForm.register('email')}
                                        className="w-full"
                                        disabled
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                variant="mystyle"
                                onClick={profileForm.handleSubmit(handleProfileSave)}
                                disabled={profileLoading}
                            >
                                {profileLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='mt-5'>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Enter your new password twice</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        {...passwordForm.register('newPassword')}
                                        className="w-full"
                                    />
                                    {passwordForm.formState.errors.newPassword && (
                                        <p className="text-sm text-destructive px-2">
                                            {passwordForm.formState.errors.newPassword?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Repeat New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        {...passwordForm.register('confirmPassword')}
                                        className="w-full"
                                    />
                                    {passwordForm.formState.errors.confirmPassword && (
                                        <p className="text-sm text-destructive px-2">
                                            {passwordForm.formState.errors.confirmPassword?.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {passwordError && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{passwordError}</AlertDescription>
                                </Alert>
                            )}

                            {passwordSuccess && (
                                <Alert>
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>Password updated successfully!</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                className="w-full"
                                onClick={handlePasswordChange}
                                variant="mystyle"
                                disabled={passwordLoading || passwordSuccess || !passwordForm.formState.isValid}
                            >
                                {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
