import { supabase } from "@/lib/supabase"
import type { VenueRead } from "@/types/types"
import { Button } from "../ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

type HeaderProps = {
    venue: VenueRead
    onEdit: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Header({ venue, onEdit }: HeaderProps) {
    const navigate = useNavigate()
    const bgPath = venue?.background ?? "logos/defaultBG.png"
    const logoPath = venue?.logo ?? "logos/default.png"

    const { data: bgData } = supabase.storage.from("images").getPublicUrl(bgPath)
    const { data: logoData } = supabase.storage.from("images").getPublicUrl(logoPath)

    const bgUrl = bgData.publicUrl
    const logoUrl = logoData.publicUrl
    return (
        <div className="mx-auto sm:w-full max-w-[450px]">
            <header className="relative overflow-hidden rounded-b-3xl">
                {/* BACK */}
                <Button
                    type="button"
                    variant="default"
                    size="sm"
                    className="absolute left-3 top-3 z-20"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft />
                </Button>
                <div
                    className="h-56 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${bgUrl})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-end justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-14 w-14 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                                <img
                                    src={logoUrl ?? "/logos/default.png"}
                                    alt={venue?.name ?? "Logo"}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <div className="text-xs font-medium text-white/80">
                                    Online menu
                                </div>
                                <div className="truncate text-lg font-semibold text-white">
                                    {venue?.name ?? "Restaurant name"}
                                </div>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="shrink-0 bg-white/85 text-black hover:bg-white"
                            onClick={() => onEdit(true)}
                        >
                            Edit
                        </Button>
                    </div>
                </div>
            </header>
        </div>
    )
}