import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
    name: z.string("Enter your name").min(2, "Name must be at least 6 characters").max(20, "Too long!"),
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const useSignup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '', name: '' }
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                dispatch(setUser(session.user));
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                dispatch(setUser(session?.user));
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch, navigate]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: values.email,
                password: values.password,
                options: {
                    data: {
                        full_name: values.name,
                    }
                }
            });

            if (error) {
                form.setError('root', { message: error.message });
                return;
            }

            if (data.user) {
                const userWithName = {
                    ...data.user,
                    full_name: values.name
                }
                dispatch(setUser(userWithName));
            }
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, onSubmit };
};
