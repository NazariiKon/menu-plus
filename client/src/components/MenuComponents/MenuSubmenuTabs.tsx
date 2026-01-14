import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { MenuRead } from "@/types/types"

import { Plus, ArrowLeft, ArrowRight, Pencil, Trash2 } from "lucide-react"
import { Alert } from "../Alert"

type Props = {
    menus: MenuRead[]
    value?: string
    defaultValue?: string
    onValueChange?: (menuId: string) => void

    onAddBetween?: (insertAfterMenu: number) => void

    onEdit?: (menuId: string) => void
    onDelete: (menuId: string) => void
    onMoveLeft?: (menuId: string) => void
    onMoveRight?: (menuId: string) => void

    className?: string
}

export function MenuSubmenuTabs({
    menus,
    value,
    defaultValue,
    onValueChange,
    onAddBetween,
    onEdit,
    onDelete,
    onMoveLeft,
    onMoveRight,
    className,
}: Props) {
    const [openDelete, setOpenDelete] = React.useState(false);
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<string | undefined>(
        defaultValue ?? menus[0]?.id
    )

    React.useEffect(() => {
        if (!controlled && internalValue === undefined && menus[0]?.id) {
            setInternalValue(menus[0].id)
        }
    }, [controlled, internalValue, menus])

    const activeId = controlled ? value : internalValue

    const setActive = (id: string) => {
        if (!controlled) setInternalValue(id)
        onValueChange?.(id)
    }

    const sortedMenus = React.useMemo(() => {
        return [...menus].sort((a: any, b: any) => {
            const ap = typeof a.position === "number" ? a.position : 0
            const bp = typeof b.position === "number" ? b.position : 0
            return ap - bp
        })
    }, [menus])

    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-x-auto overflow-y-hidden px-2">
                <div className="flex items-start gap-2 w-max">
                    <div className="shrink-0">
                        <IconPlusButton
                            onClick={() => onAddBetween?.(0)}
                            ariaLabel="Add submenu"
                        />
                    </div>

                    {sortedMenus.map((m, idx) => {
                        const active = m.id === activeId
                        const isFirst = idx === 0
                        const isLast = idx === sortedMenus.length - 1

                        return (
                            <React.Fragment key={m.id}>
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActive(m.id)}
                                        className={cn(
                                            "h-10 rounded-full px-5 text-sm font-semibold",
                                            "border-2 border-black transition-colors",
                                            active ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
                                        )}
                                    >
                                        {m.name}
                                    </button>

                                    <div className="flex items-center gap-1 rounded-xl bg-black">
                                        {!isFirst && (
                                            <IconActionButton
                                                onClick={() => onMoveLeft?.(m.id)}
                                                ariaLabel="Move left"
                                            >
                                                <ArrowLeft className="h-3 w-3 text-white" />
                                            </IconActionButton>
                                        )}

                                        {!isLast && (
                                            <IconActionButton
                                                onClick={() => onMoveRight?.(m.id)}
                                                ariaLabel="Move right"
                                            >
                                                <ArrowRight className="h-3 w-3 text-white" />
                                            </IconActionButton>
                                        )}

                                        <IconActionButton onClick={() => onEdit?.(m.id)} ariaLabel="Edit">
                                            <Pencil className="h-3 w-3 text-white" />
                                        </IconActionButton>

                                        <Alert
                                            description="This action cannot be undone. This will permanently delete your submenu."
                                            open={openDelete}
                                            onOpenChange={setOpenDelete}
                                            onConfirm={onDelete}
                                            id={m.id}
                                        >
                                            <IconActionButton ariaLabel="Delete">
                                                <Trash2 className="h-3 w-3 text-white" />
                                            </IconActionButton>
                                        </Alert>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <IconPlusButton
                                        onClick={() => onAddBetween?.(m.position)}
                                        ariaLabel="Add submenu"
                                    />
                                </div>
                            </React.Fragment>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function IconPlusButton({
    onClick,
    ariaLabel,
}: {
    onClick?: () => void
    ariaLabel: string
}) {
    return (
        <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-7 w-7 mt-1.5 rounded-full border-2 border-black bg-white text-black hover:bg-black/5"
            onClick={onClick}
            aria-label={ariaLabel}
            title={ariaLabel}
        >
            <Plus className="h-3 w-3" />
        </Button>
    )
}

function IconActionButton({
    onClick,
    ariaLabel,
    children,
}: {
    onClick?: () => void
    ariaLabel: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={ariaLabel}
            title={ariaLabel}
            className="grid h-9 w-6 place-items-center rounded-lg bg-black hover:bg-white/10"
        >
            {children}
        </button>
    )
}
