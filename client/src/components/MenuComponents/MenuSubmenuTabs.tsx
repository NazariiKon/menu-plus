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
    const [openDelete, setOpenDelete] = React.useState(false)
    const controlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<string | undefined>()

    const sortedMenus = React.useMemo(() => {
        return [...(menus ?? [])].sort((a: MenuRead, b: MenuRead) => {
            const ap = a.position ?? 0
            const bp = b.position ?? 0
            return ap - bp
        })
    }, [menus])

    const firstMenu = React.useMemo(() => {
        return sortedMenus.find(menu => (menu.position ?? 0) === 1)
    }, [sortedMenus])

    React.useEffect(() => {
        if (!controlled && internalValue === undefined && firstMenu) {
            setInternalValue(firstMenu.id)
        }
    }, [controlled, internalValue, firstMenu])

    const activeId = controlled ? value : internalValue

    const setActive = (id: string) => {
        if (!controlled) setInternalValue(id)
        onValueChange?.(id)
    }

    return (
        <div className={cn("w-full", className)}>
            <div className="overflow-x-auto overflow-y-hidden px-2">
                <div className="flex items-start gap-2 w-max">
                    <div className="shrink-0 pt-1.5">
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
                            <div key={m.id} className="flex items-start gap-2 shrink-0">
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setActive(m.id)}
                                        className={cn(
                                            "h-10 rounded-full px-5 text-sm font-semibold",
                                            "border-2 border-black transition-all duration-200",
                                            active
                                                ? "bg-black text-white shadow-md"
                                                : "bg-white text-black hover:bg-black/5 hover:shadow-sm"
                                        )}
                                    >
                                        {m.name}
                                    </button>

                                    <div className="flex items-center gap-1 rounded-xl bg-black p-0.5">
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

                                        <IconActionButton
                                            onClick={() => onEdit?.(m.id)}
                                            ariaLabel="Edit"
                                        >
                                            <Pencil className="h-3 w-3 text-white" />
                                        </IconActionButton>

                                        <Alert
                                            key={`delete-${m.id}`}
                                            description="This action cannot be undone. This will permanently delete your submenu."
                                            open={openDelete}
                                            onOpenChange={setOpenDelete}
                                            onConfirm={() => onDelete(m.id)}
                                            id={m.id}
                                        >
                                            <IconActionButton ariaLabel="Delete">
                                                <Trash2 className="h-3 w-3 text-white" />
                                            </IconActionButton>
                                        </Alert>
                                    </div>
                                </div>

                                <div className="shrink-0 pt-1.5">
                                    <IconPlusButton
                                        onClick={() => onAddBetween?.(idx + 1)}
                                        ariaLabel={`Add submenu after ${m.name}`}
                                    />
                                </div>
                            </div>
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
            variant="ghost"
            size="sm"
            className="h-8 w-8 rounded-full border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:border-black transition-all"
            onClick={onClick}
            aria-label={ariaLabel}
            title={ariaLabel}
        >
            <Plus className="h-3.5 w-3.5" />
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
            className="group grid h-8 w-7 place-items-center rounded-md bg-black hover:bg-white/20 transition-all"
        >
            {children}
        </button>
    )
}
