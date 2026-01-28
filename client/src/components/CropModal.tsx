import { useState, useCallback } from "react";
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
        <div
            className="fixed inset-0 z-99 bg-black bg-opacity-80 flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <div
                className="bg-white rounded-lg overflow-hidden max-w-lg w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative h-64 md:h-80 bg-gray-100">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={size}
                        onCropChange={setCrop}
                        onCropAreaChange={onCropAreaChange}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className="p-4 border-t flex flex-col sm:flex-row sm:justify-between gap-2">
                    <div className="flex items-center">
                        <label className="text-sm text-gray-600 mr-2">Zoom:</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="w-24"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="rounded-lg text-sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSaveCrop}
                            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all"
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
