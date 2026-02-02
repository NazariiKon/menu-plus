import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ChevronRight, Trash } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@supabase/supabase-js";
import Verification from "@/components/ui/verification";
import type { VenueRead } from "@/types/types";
import { NameModal, type FormValues } from "@/components/NameModal";
import { createVenue, deleteVenue, get_my_venues } from "@/api/venue";
import { Alert } from "@/components/Alert";
import { supabase } from "@/lib/supabase";


export default function Admin() {
    const navigate = useNavigate();
    const currentUser = useSelector((state: RootState) => state.user.currentUser) as User | null;
    const [venues, setVenues] = useState<VenueRead[]>([]);
    const [error, setError] = useState<string>();
    const [open, setOpen] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleCreate = async (values: FormValues) => {
        const res = await createVenue(values);
        if (!res) return;
        await getVenues();
    };

    const handleDelete = async (venueId: string) => {
        if (venueId == null) return
        console.log("Delete", venueId)
        await deleteVenue(venueId);
        await getVenues();
    }

    const getVenues = async () => {
        setLoading(true);
        const result = await get_my_venues();

        if (result.success && result.data) {
            setVenues(result.data);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }

        if (currentUser.confirmed_at) {
            getVenues();
        }
    }, [currentUser]);

    if (!currentUser || error) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!currentUser.email_confirmed_at && currentUser.email) {
        return <Verification email={currentUser.email} />
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
                        onClick={() => setOpen(true)}
                    >
                        <Building2 className="w-5 h-5 mr-2" />
                        New Venue
                    </Button>
                </div>

                <div className="space-y-4">
                    <NameModal
                        open={open}
                        onOpenChange={setOpen}
                        onSubmit={handleCreate}
                        title="Add venue"
                        description="Enter a venue name."
                        submitLabel="Create"
                    />

                    {loading ? (
                        <div className="space-y-4 ">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} className="h-48 w-full rounded-2xl bg-gray-200" />
                            ))}
                        </div>
                    ) : venues.length === 0 ? (
                        <>
                            <Card className="border-0 bg-white/60 backdrop-blur-xl text-center p-20 rounded-3xl shadow-xl">
                                <Building2 className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No venues yet</h3>
                                <p className="text-gray-600 mb-8">Create your first venue to get started</p>
                                <Button
                                    size="lg"
                                    className="px-12 py-6  rounded-xl"
                                    onClick={() => setOpen(true)}
                                >
                                    Create First Venue
                                </Button>
                            </Card>
                        </>

                    ) : (
                        venues.map((venue) => (
                            <Card
                                key={venue.id}
                                className="border-0 bg-white/80 backdrop-blur-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 hover:bg-white/95 rounded-3xl overflow-hidden shadow-lg group"
                            >
                                <CardContent className="p-0">
                                    <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:gap-8">
                                        <div className="flex items-start lg:items-center gap-2 flex-1 mb-6 lg:mb-0">
                                            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-xl transition-shadow flex-shrink-0">
                                                <img
                                                    src={supabase.storage.from("images/").getPublicUrl(venue.logo).data.publicUrl}
                                                    alt={venue.name}
                                                    className="object-cover rounded-xl group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        e.currentTarget.src = '/logos/default.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    to={`../p/${venue.slug}`}
                                                    className="block hover:text-indigo-600 transition-colors font-bold text-xl lg:text-2xl leading-tight line-clamp-2"
                                                >
                                                    {venue.name}
                                                </Link>
                                                <div className="text-sm font-mono text-indigo-600 bg-indigo-100/50 px-3 py-1 rounded-full mt-3 w-fit">
                                                    /{venue.slug}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid min-[350px]:grid-cols-[auto_1fr_auto] grid-cols-1 items-center gap-2 ml-auto lg:ml-0">
                                            <Alert
                                                description="This action cannot be undone. This will permanently delete your venue and remove your venue's data from our servers."
                                                open={openDelete}
                                                onOpenChange={setOpenDelete}
                                                onConfirm={handleDelete}
                                                id={venue.id}
                                            >
                                                <Button
                                                    variant="destructive"
                                                    size="lg"
                                                    className="px-6 h-12 rounded-xl font-medium border border-gray-200 hover:border-gray-400 inline-flex items-center"
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </Button>
                                            </Alert>


                                            <Button
                                                asChild
                                                size="lg"
                                                className="px-8 h-12 rounded-xl"
                                            >
                                                <Link to={`../p/${venue.slug}`}>
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
