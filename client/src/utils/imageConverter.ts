export const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
        };
        reader.onerror = () => reject(new Error('Something wrong with your file'));
        reader.readAsDataURL(file);
    });
};

export const createImagePreview = (
    file: File | null | undefined,
    callback: (preview: string | null) => void
) => {
    if (!file) {
        callback(null);
        return;
    }
    const reader = new FileReader();
    reader.onloadend = () => callback(reader.result as string);
    reader.readAsDataURL(file);
};