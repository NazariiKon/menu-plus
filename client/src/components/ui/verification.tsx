import { useEffect, useState } from 'react'
import { Link, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Verification({ email }: { email: string }) {
    const navigate = useNavigate();
    const [isVerified, setIsVerified] = useState(false)
    const [loading, setLoading] = useState(false)
    const [resendDisabled, setResendDisabled] = useState(false)
    const [resendCounter, setResendCounter] = useState(0)

    const checkVerification = async () => {
        setLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) {
            console.log('Error fetching user:', error.message)
            setLoading(false)
            return
        }
        if (user && user.email_confirmed_at) {
            setIsVerified(true)
        }
        setLoading(false)
    }

    const handleResend = async () => {
        setResendCounter(30)
        setResendDisabled(true)

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        })

        if (error) {
            console.error('Error resending email:', error.message)
        } else {
            alert('Verification email resent! Check your inbox.')
        }
    }
    useEffect(() => {
        if (resendCounter > 0) {
            const timer = setInterval(() => {
                setResendCounter(prev => {
                    if (prev <= 1) {
                        setResendDisabled(false)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [resendCounter])

    useEffect(() => {
        checkVerification()
    }, [])

    if (isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-20 px-4 flex items-center justify-center">
                <Card className="max-w-md w-full mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                            <Mail className="w-12 h-12 text-white" />
                        </div>
                        <CardTitle className="text-3xl font-black text-gray-900">Verified!</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-8">
                        <p className="text-xl text-gray-600 text-center leading-relaxed">
                            Your email <strong>{email}</strong> is confirmed ✅
                        </p>
                        <Button
                            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500"
                            onClick={() => {
                                navigate('/admin')
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4 flex items-center justify-center">
            <Card className="max-w-md w-full mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                        <Mail className="w-12 h-12 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-black text-gray-900">
                        Confirm Your Email
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <p className="text-xl text-gray-600 text-center leading-relaxed">
                        We sent a verification link to <strong>{email}</strong>
                    </p>
                    <div className="space-y-3 text-center text-sm text-gray-500">
                        <p>✅ Check your inbox (including spam/promotions)</p>
                        <p>✅ Click the verification link</p>
                        <p>✅ Return here to manage your menu</p>
                    </div>

                    <div className="flex flex-col items-center gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto px-8"
                            asChild
                            disabled={resendDisabled}
                        >
                            <Link to="#" onClick={handleResend}>
                                {resendDisabled
                                    ? `Resend Email (waiting ${resendCounter}s)`
                                    : 'Resend Email'}
                            </Link>
                        </Button>

                        <Button
                            className="w-full sm:w-auto px-8 bg-gradient-to-r from-emerald-600 to-indigo-600"
                            onClick={checkVerification}
                            disabled={loading}
                        >
                            {loading ? 'Checking...' : 'Refresh Status'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
