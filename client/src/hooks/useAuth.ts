import { useState, useEffect } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { supabase } from '@/lib/supabase';

interface AuthFormData {
    email: string;
    password: string;
    name?: string;
}

interface UseAuthReturn {
    form: UseFormReturn<AuthFormData>;
    isSignup: boolean;
    loading: boolean;
    googleLoading: boolean;
    toggleMode: () => void;
    onSubmit: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    updateUserPassword: (password: string) => Promise<any>;
}

const signupSchema = z.object({
    name: z.string().min(2, "Name must be at least 6 characters").max(20, "Too long!"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

const signinSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const useAuth = (initialMode: 'signin' | 'signup' = 'signin'): UseAuthReturn => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [isSignup, setIsSignup] = useState(initialMode === 'signup');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const form = useForm<AuthFormData>({
        resolver: zodResolver(isSignup ? signupSchema : signinSchema),
        defaultValues: { email: '', password: '', name: '' }
    });

    const toggleMode = () => {
        form.reset();
        setIsSignup(!isSignup);
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                dispatch(setUser(session.user));
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                dispatch(setUser(session.user));
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch, navigate, isSignup]);

    async function forgotPassword(email: string) {
        console.log('redirectTo:', `${window.location.origin}/update-password`);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });

        if (error) {
            throw error;
        }
    }

    async function updateUserPassword(password: string) {
        const { data, error } = await supabase.auth.updateUser({
            password,
        });

        if (error) {
            throw error;
        }

        return data;
    }

    const onSubmit = async () => {
        const values = form.getValues();
        setLoading(true);

        try {
            if (isSignup) {
                const { error } = await supabase.auth.signUp({
                    email: values.email,
                    password: values.password,
                    options: { data: { full_name: values.name } }
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: values.email,
                    password: values.password
                });
                if (error) throw error;
            }
        } catch (error: any) {
            form.setError('root', { message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        setGoogleLoading(true);
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
            });
        } catch (error) {
            form.setError('root', { message: 'Google auth failed' });
        } finally {
            setGoogleLoading(false);
        }
    };

    return {
        form,
        isSignup,
        loading,
        googleLoading,
        toggleMode,
        onSubmit,
        signInWithGoogle,
        forgotPassword,
        updateUserPassword
    };
};
