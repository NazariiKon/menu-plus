import * as React from "react";

type UseImageCroppingProps = {
    maxSizeMB?: number;
    onCropped: (file: File) => void;
    setIsOpen: (_: boolean) => void;
};

export function useImageCropping({ maxSizeMB = 10, onCropped, setIsOpen }: UseImageCroppingProps) {
    const [cropModalOpen, setCropModalOpen] = React.useState(false);
    const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSizeMB * 1024 * 1024) {
            alert(`File too large. Max ${maxSizeMB} MB`);
            e.target.value = "";
            return;
        }

        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        setIsOpen(true);
        setCropModalOpen(true);
    };

    const handleCropComplete = (croppedFile: File) => {
        onCropped(croppedFile);
        setCropModalOpen(false);
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
        setCropImageSrc(null);
    };

    const handleCropCancel = () => {
        setCropModalOpen(false);
        if (cropImageSrc) URL.revokeObjectURL(cropImageSrc);
        setCropImageSrc(null);
    };

    return {
        cropModalOpen,
        cropImageSrc,
        handleFileInputChange,
        handleCropComplete,
        handleCropCancel,
    };
}
