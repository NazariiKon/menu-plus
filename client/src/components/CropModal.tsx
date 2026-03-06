import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";

interface Crop {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface CropModalProps {
    imageSrc: string;
    onCropComplete: (file: File) => void;
    onCancel: () => void;
    size: number;
}

export function CropModal({ imageSrc, onCropComplete, onCancel, size }: CropModalProps) {
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    // Lock body scroll while modal is open
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onCancel]);

    const onCropAreaChange = useCallback(
        (_: Area, croppedAreaPixels: Area) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const createCropImage = useCallback(
        (image: HTMLImageElement, crop: Area): Promise<File> => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("2D context not available");

            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            canvas.width = crop.width;
            canvas.height = crop.height;

            ctx.drawImage(
                image,
                crop.x * scaleX,
                crop.y * scaleY,
                crop.width * scaleX,
                crop.height * scaleY,
                0,
                0,
                crop.width,
                crop.height
            );

            return new Promise<File>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], "cropped-image.png", { type: "image/png" });
                            resolve(file);
                        } else {
                            reject(new Error("Canvas toBlob failed"));
                        }
                    },
                    "image/png",
                    0.9
                );
            });
        },
        []
    );

    const handleSaveCrop = useCallback(async () => {
        if (!croppedAreaPixels) return;

        const img = new Image();
        img.src = imageSrc;
        await img.decode();

        const croppedFile = await createCropImage(img, croppedAreaPixels);
        onCropComplete(croppedFile);
    }, [imageSrc, croppedAreaPixels, createCropImage, onCropComplete]);

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 animate-in fade-in-0"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative z-10 w-[calc(100vw-2rem)] max-w-[600px] h-[80vh] max-h-[600px] flex flex-col bg-white shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-0 zoom-in-95">
                {/* Cropper area — no native drag interference */}
                <div
                    className="relative flex-1 bg-black/5 w-full"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                >
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={size}
                        onCropChange={setCrop}
                        onCropAreaChange={onCropAreaChange}
                        onZoomChange={setZoom}
                        mediaProps={{ draggable: false } as React.MediaHTMLAttributes<HTMLImageElement>}
                        style={{ containerStyle: { touchAction: "none" } }}
                    />
                </div>

                {/* Controls */}
                <div className="p-4 bg-white border-t flex flex-col sm:flex-row sm:justify-between gap-4 shrink-0">
                    <div className="flex items-center justify-center sm:justify-start">
                        <label className="text-sm font-medium text-gray-700 mr-3">Zoom:</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-32 accent-indigo-600 cursor-pointer"
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="rounded-lg text-sm min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveCrop}
                            className="rounded-lg min-w-[120px] bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
                        >
                            Save Crop
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
