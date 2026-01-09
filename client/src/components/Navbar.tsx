import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
    SheetDescription
} from '@/components/ui/sheet'
import { Menu, ArrowRight, Home, Sparkles, DollarSign } from 'lucide-react'
import { useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store/store'
import { useDispatch } from 'react-redux';
import { clearUser } from '@/store/userSlice'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
    const location = useLocation()
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((state: RootState) => state.user.currentUser);



    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/features', label: 'Features', icon: Sparkles },
        { path: '/pricing', label: 'Pricing', icon: DollarSign },
    ]

    { currentUser && <span>{currentUser?.email}</span> }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-xl supports-[backdrop-filter:blur(20px)]:bg-white/80 shadow-sm">
            <div className="flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto w-full">
                <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center space-x-2 font-bold text-xl bg-gradient-to-r from-blue-600 via-blue-600 to-slate-700 bg-clip-text text-transparent transition-all hover:scale-105">
                        Menu+
                    </Link>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer h-9 w-9 p-0 md:hidden mt-1"
                            >
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle Menu</span>
                            </Button>

                        </SheetTrigger>
                        <SheetContent side="left" className="w-72 border-r-slate-200 p-0 sm:w-80">
                            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                            <SheetDescription className="sr-only">Main navigation links</SheetDescription>

                            <div className="flex flex-col h-full p-6 space-y-3 pt-10">
                                <Link
                                    to="/"
                                    className="mb-8 flex items-center space-x-2 pb-6 border-b border-slate-200"
                                >
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-slate-700 bg-clip-text text-transparent">
                                        Menu+
                                    </span>
                                </Link>

                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`group flex items-center space-x-3 rounded-xl p-3 font-medium transition-all duration-200 ${isActive
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:shadow-md'
                                                }`}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-700'}`} />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                <div className="hidden items-center gap-2 md:flex lg:gap-4">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`inline-flex items-center space-x-1 rounded-full px-4 py-2 font-medium transition-all duration-200 ${isActive
                                    ? 'bg-blue-100 text-blue-700 shadow-md'
                                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                    }`}
                            >
                                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-2">
                    {currentUser ? (
                        <Button
                            onClick={() => {
                                localStorage.removeItem('access_token');
                                localStorage.removeItem('refresh_token');
                                dispatch(clearUser());
                            }}
                        >
                            Logout
                        </Button>


                    ) : (
                        <div className="hidden gap-2 md:flex">
                            <Link to="/login">
                                <Button variant="ghost" className="h-10 px-6 text-slate-700 hover:text-slate-900 font-medium transition-all duration-200 hover:shadow-sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="h-10 px-6 bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
