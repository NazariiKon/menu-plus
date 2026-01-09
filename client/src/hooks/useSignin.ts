import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '@/api/user';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import type { Response } from '../types/api';

const formSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const useSignin = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const result: Response = await login(values);
            if (result.success && result.user) {
                console.log(result.user);
                dispatch(setUser(result.user));
                navigate('/', { replace: true });
            } else {
                form.setError('root', {
                    type: 'server',
                    message: result.error || 'Login failed'
                });
            }
        } catch (error) {
            form.setError('root', {
                type: 'server',
                message: 'Network error'
            });
        } finally {
            setLoading(false);
        }
    };

    return { form, loading, onSubmit };
};
