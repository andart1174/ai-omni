export const colorizeImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = 'rgba(0, 122, 255, 0.2)'; // Blue-ish tint
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => resolve(URL.createObjectURL(blob!)), 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
};

export const restoreImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.filter = 'contrast(1.2) brightness(1.1) saturate(1.1) contrast(1.1)';
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => resolve(URL.createObjectURL(blob!)), 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
};

export const denoiseImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.filter = 'blur(1px) contrast(1.1)';
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => resolve(URL.createObjectURL(blob!)), 'image/png');
        };
        img.src = URL.createObjectURL(file);
    });
};
