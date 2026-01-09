import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Zap, Menu, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

type User = {
    id: string;
    email: string;
    email_verified?: boolean;
};

export default function Admin() {
    const currentUser = useSelector((state: RootState) => state.user.currentUser) as User | null;

    if (!currentUser) {
        return <div>Not logged in</div>;
    }

    if (!currentUser.email_verified) {
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
                            We sent a verification link to <strong>{currentUser.email}</strong>
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
                            >
                                <Link to="/register">Resend Email</Link>
                            </Button>
                            <Button className="w-full sm:w-auto px-8 bg-gradient-to-r from-emerald-600 to-indigo-600">
                                Refresh Status
                            </Button>
                        </div>

                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-20 space-y-6">
                    <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-emerald-900 to-gray-900 bg-clip-text text-transparent">
                        Cafe Admin
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Manage your digital menu, generate QR codes, track analytics
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <Card className="group bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all border-0">
                        <CardContent className="p-10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all">
                                <Menu className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600">
                                Manage Dishes
                            </h3>
                            <p className="text-gray-600 mb-6">Add, edit, delete menu items</p>
                            <Button className="w-full" asChild>
                                <Link to="/admin/dishes">Open Menu Editor</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="group bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all border-0">
                        <CardContent className="p-10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600">
                                Generate QR Codes
                            </h3>
                            <p className="text-gray-600 mb-6">Print table QR codes instantly</p>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/admin/qr">Print QR Codes</Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="group bg-white/80 backdrop-blur-xl shadow-2xl hover:shadow-3xl hover:-translate-y-2 transition-all border-0">
                        <CardContent className="p-10 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-all">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600">
                                View Analytics
                            </h3>
                            <p className="text-gray-600 mb-6">See popular dishes and views</p>
                            <Button variant="outline" className="w-full" asChild>
                                <Link to="/admin/analytics">See Insights</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
