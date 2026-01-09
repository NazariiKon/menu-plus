import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { signup } from '@/api/user';

const formSchema = z.object({
    email: z.email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters")
});

export const useSignup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: '', password: '' }
    });

    interface SignupResponse {
        success: boolean;
        error?: string;
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            const result: SignupResponse = await signup(values);
            if (result.success) {
                navigate('/', { replace: true });
            } else {
                form.setError('root', {
                    type: 'server',
                    message: result.error || 'Registration failed'
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
