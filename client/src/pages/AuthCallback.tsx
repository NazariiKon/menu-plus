import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const type = searchParams.get('type');
        const token_hash = searchParams.get('token_hash') || searchParams.get('token');

        if (type === 'signup' && token_hash) {
            supabase.auth.verifyOtp({ token_hash, type: 'signup' })
                .then(({ error }) => {
                    if (error) navigate('/error');
                    else navigate('/admin');
                });
        } else {
            navigate('/');
        }
    }, []);

    return <div>Confirming email...</div>;
}
