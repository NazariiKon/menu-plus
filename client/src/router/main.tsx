import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import AuthForm from '../pages/AuthForm'
import PublicMenu from '../pages/PublicMenu'
import CafeAdmin from '../pages/CafeAdmin'
import AuthCallback from '@/pages/AuthCallback'


export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/registration" element={<AuthForm />} />
                <Route path="/:slug" element={<PublicMenu />} />
                <Route path="/:slug/admin/*" element={<CafeAdmin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

            </Routes>
        </BrowserRouter>
    )
}