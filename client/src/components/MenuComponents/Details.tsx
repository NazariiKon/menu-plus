import * as React from "react"
import { MapPin, Phone, Wifi } from "lucide-react"
import { SiInstagram, SiFacebook, SiTiktok } from "react-icons/si"

import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import type { VenueRead } from "@/types/types"

type DetailsProps = {
    venue: VenueRead
}

export function Details({ venue }: DetailsProps) {
    const items = [
        venue?.address
            ? {
                key: "address",
                icon: <MapPin className="h-4 w-4 text-muted-foreground" />,
                label: "Address",
                value: <span className="truncate">{venue.address}</span>,
            }
            : null,
        venue?.phone
            ? {
                key: "phone",
                icon: <Phone className="h-4 w-4 text-muted-foreground" />,
                label: "Phone",
                value: (
                    <a className="underline-offset-4 hover:underline" href={`tel:${venue.phone}`}>
                        {venue.phone}
                    </a>
                ),
            }
            : null,
        venue?.wifiPassword
            ? {
                key: "wifi",
                icon: <Wifi className="h-4 w-4 text-muted-foreground" />,
                label: "Wi‑Fi password",
                value: <span className="font-mono text-sm">{venue.wifiPassword}</span>,
            }
            : null,
    ].filter(Boolean) as Array<{
        key: string
        icon: React.ReactNode
        label: string
        value: React.ReactNode
    }>

    const hasActions = Boolean(
        venue?.phone ||
        venue?.google_maps_link ||
        venue?.inst_link ||
        venue?.facebook_link ||
        venue?.tiktok_link
    )

    const hasDesc = Boolean(venue?.desc?.trim())

    if (!items.length && !hasActions && !hasDesc) return null

    return (
        <Card className="sm:w-full border-0 shadow-none">
            <CardContent className="rounded-2xl bg-card/60 p-4 ring-1 ring-border/60">
                {hasDesc && (
                    <div className="text-sm whitespace-pre-wrap break-words">
                        {venue.desc}
                    </div>
                )}

                {!!items.length && (
                    <>
                        <Separator className={hasDesc ? "my-4" : "mb-4"} />
                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={item.key}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            {item.icon}
                                            <div className="text-sm text-muted-foreground">{item.label}</div>
                                        </div>

                                        <div className="min-w-0 text-right text-sm">
                                            <div className="truncate">{item.value}</div>
                                        </div>
                                    </div>

                                    {idx !== items.length - 1 && <Separator className="mt-3" />}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {hasActions && (
                    <>
                        <Separator className={items.length || hasDesc ? "my-4" : "mb-4"} />

                        <div className="flex flex-wrap items-center gap-2">
                            {venue?.phone && (
                                <Button asChild variant="secondary" size="sm">
                                    <a href={`tel:${venue.phone}`}>Call</a>
                                </Button>
                            )}

                            {venue?.google_maps_link && (
                                <Button asChild variant="secondary" size="sm">
                                    <a href={venue.google_maps_link} target="_blank" rel="noreferrer">
                                        Directions
                                    </a>
                                </Button>
                            )}

                            {venue?.inst_link && (
                                <Button asChild variant="secondary" size="icon" aria-label="Instagram">
                                    <a href={venue.inst_link} target="_blank" rel="noreferrer">
                                        <SiInstagram className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}

                            {venue?.facebook_link && (
                                <Button asChild variant="secondary" size="icon" aria-label="Facebook">
                                    <a href={venue.facebook_link} target="_blank" rel="noreferrer">
                                        <SiFacebook className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}

                            {venue?.tiktok_link && (
                                <Button asChild variant="secondary" size="icon" aria-label="TikTok">
                                    <a href={venue.tiktok_link} target="_blank" rel="noreferrer">
                                        <SiTiktok className="h-4 w-4" />
                                    </a>
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
