import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import SignUp from '../pages/SignUp'
import PublicMenu from '../pages/PublicMenu'
import CafeAdmin from '../pages/CafeAdmin'
import AuthCallback from '@/pages/AuthCallback'
import SignIn from '@/pages/SignIn'
import WithNavbarLayout from '@/layout/WithNavbar'
import { useEffect } from "react";
import type { AppDispatch } from '@/store/store'
import { setUser, setLoading } from '@/store/userSlice'
import { supabase } from '@/lib/supabase'
import { useDispatch } from 'react-redux';

export default function AppRouter() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(setLoading(true));

        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.exp * 1000 > Date.now()) {
                    dispatch(setUser({
                        id: payload.sub,
                        email: payload.email,
                        email_verified: payload.user_metadata?.email_verified,
                    }));
                    dispatch(setLoading(false));
                    return;
                }
            } catch (e) {
                console.log('Invalid token');
            }
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                dispatch(setUser(session.user));
            } else {
                dispatch(setUser(null));
            }
            dispatch(setLoading(false));
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                dispatch(setUser(session?.user ?? null));
            }
        );

        return () => subscription.unsubscribe();
    }, [dispatch]);


    return (
        <BrowserRouter>
            <Routes>
                <Route element={<WithNavbarLayout />}>
                    <Route path="/" element={<Home />} />
                </Route>

                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<SignIn />} />
                <Route path="/:slug" element={<PublicMenu />} />
                <Route path="/:slug/admin/*" element={<CafeAdmin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

            </Routes>
        </BrowserRouter>
    )
}