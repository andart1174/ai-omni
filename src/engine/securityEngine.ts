export const stripExif = async (file: File): Promise<string> => {
    // A robust local way to strip metadata is to redraw the image on a canvas
    // and export it. This removes all EXIF, GPS, etc.
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Canvas context error");
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
                else reject("Blob creation error");
            }, file.type);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const applyWatermark = async (file: File, text: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Canvas context error");

            ctx.drawImage(img, 0, 0);

            // Draw professional watermark
            ctx.font = `${Math.round(img.width / 15)}px sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.textAlign = 'center';
            ctx.fillText(text, img.width / 2, img.height / 2);

            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
                else reject("Blob creation error");
            }, file.type);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
