import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Edit, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@supabase/supabase-js";
import Verification from "@/components/ui/verification";
import type { VenueRead } from "@/types/types";
import { get_my_venues } from "@/api/venue";

export default function Admin() {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.currentUser) as User | null;
    const [venues, setVenues] = useState<VenueRead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const getVenues = async () => {
            setLoading(true);
            const result = await get_my_venues();

            console.log(result);

            if (result.success && result.data) {
                setVenues(result.data);
            } else {
                console.error(result.error);
            }

            setLoading(false);
        };

        getVenues();
    }, [currentUser]);

    if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!currentUser.confirmation_sent_at && currentUser.email) {
        <Verification email={currentUser.email} />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12 lg:mb-20">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <Building2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
                                Your Venues
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">Manage your locations</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mb-8">
                    <Button
                        size="lg"
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all font-semibold rounded-xl"
                        onClick={() => navigate("/admin/venues/new")}
                    >
                        <Building2 className="w-5 h-5 mr-2" />
                        New Venue
                    </Button>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="space-y-4 ">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-2xl bg-gray-200" />
                            ))}
                        </div>
                    ) : venues.length === 0 ? (
                        <Card className="border-0 bg-white/60 backdrop-blur-xl text-center p-20 rounded-3xl shadow-xl">
                            <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues yet</h3>
                            <p className="text-gray-600 mb-8">Create your first venue to get started</p>
                            <Button
                                size="lg"
                                className="px-12 py-6 bg-gradient-to-r from-emerald-600 to-indigo-600 text-white shadow-2xl rounded-xl font-bold text-lg"
                                onClick={() => navigate("/admin/venues/new")}
                            >
                                Create First Venue
                            </Button>
                        </Card>
                    ) : (
                        venues.map((venue) => (
                            <Card
                                key={venue.id}
                                className="border-0 bg-white/80 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:bg-white/95 rounded-3xl overflow-hidden shadow-lg group"
                            >
                                <CardContent className="p-0">
                                    <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:gap-8">
                                        <div className="flex items-start lg:items-center gap-2 flex-1 mb-6 lg:mb-0">
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center p-4 shadow-md group-hover:shadow-xl transition-shadow flex-shrink-0">
                                                <img
                                                    src={`/logos/${venue.logo}`}
                                                    alt={venue.name}
                                                    className="w-16 h-16 object-cover rounded-xl group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/logos/default.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    to={`/admin/venues/${venue.slug}`}
                                                    className="block hover:text-indigo-600 transition-colors font-bold text-xl lg:text-2xl leading-tight line-clamp-2"
                                                >
                                                    {venue.name}
                                                </Link>
                                                <div className="text-sm font-mono text-indigo-600 bg-indigo-100/50 px-3 py-1 rounded-full mt-3 w-fit">
                                                    /{venue.slug}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto lg:ml-0">
                                            <Button
                                                variant="outline"
                                                size="lg"
                                                className="px-6 h-12 border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl font-medium"
                                                asChild
                                            >
                                                <Link to={`/admin/venues/${venue.slug}/edit`}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Link>
                                            </Button>
                                            <Button
                                                asChild
                                                size="lg"
                                                className="px-8 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl font-semibold"
                                            >
                                                <Link to={`/${venue.slug}`}>
                                                    Open Menu
                                                    <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
