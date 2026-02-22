export const removeBackground = async (file: File): Promise<string> => {
    try {
        // Dynamic import to prevent module-level crashes on startup
        const module = await import('@imgly/background-removal');
        const removeFn = typeof module.default === 'function' ? module.default : (module as any).removeBackground || module;

        const blob = await removeFn(file, {
            progress: (msg: string, progress: number) => {
                console.log(`AI BG Removal [${msg}]: ${Math.round(progress * 100)}%`);
            }
        });
        return URL.createObjectURL(blob);
    } catch (err: any) {
        throw new Error(`AI BG Removal Error: ${err.message}. Ensure SharedArrayBuffer is enabled.`);
    }
};

export const upscaleImage = async (file: File, factor: 2 | 4 = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * factor;
            canvas.height = img.height * factor;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Canvas context error");

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
                if (blob) resolve(URL.createObjectURL(blob));
                else reject("Blob creation error");
            }, 'image/jpeg', 0.95);
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
