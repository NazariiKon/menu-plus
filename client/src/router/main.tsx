import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import SignUp from '../pages/SignUp'
import AuthCallback from '@/pages/AuthCallback'
import SignIn from '@/pages/SignIn'
import WithNavbarLayout from '@/layout/WithNavbar'
import { useEffect } from "react";
import type { AppDispatch } from '@/store/store'
import { setUser, setLoading } from '@/store/userSlice'
import { supabase } from '@/lib/supabase'
import { useDispatch } from 'react-redux';
import AuthGuard from '@/components/AuthGuard'
import AdminHome from '@/pages/AdminHome'
import MenuPanel from '@/components/PanelComponents/MenuPanel'
import Pricing from '@/components/Main/Pricing'
import PublicMenuLayout from '@/pages/PublicMenuLayout'
import PublicMenuContent from '@/pages/PublicMenuContent'
import Order from '@/components/MenuComponents/Order'
import { Stats } from '@/components/PanelComponents/Stats'
import PanelLayout from '@/components/PanelComponents/PanelLayout'

export default function AppRouter() {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        fetch('https://menu-plus-server.onrender.com/')
            .catch(() => console.log("Server waking up..."));
    }, []);

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
                    <Route path="/admin" element={<AdminHome />} />
                    <Route path="/pricing" element={<Pricing />} />
                </Route>
                <Route path="/login" element={
                    <AuthGuard>
                        <SignIn />
                    </AuthGuard>
                } />
                <Route path="/signup" element={
                    <AuthGuard>
                        <SignUp />
                    </AuthGuard>
                } />

                <Route path="/p/:slug" element={<PublicMenuLayout />}>
                    <Route index element={<PublicMenuContent />} />
                    <Route path="order" element={<Order />} />
                </Route>

                <Route path="/panel/:slug" element={<PanelLayout />}>
                    <Route path="qr-code" element={<MenuPanel />} />
                    <Route path="/panel/:slug/stats" element={<Stats />} />
                </Route>


                <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
        </BrowserRouter>
    )
}