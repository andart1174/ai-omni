export const eraseObject = async (file: File, x: number, y: number, w: number, h: number): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            // Simple "In-painting" by blurring and stretching surrounding pixels
            ctx.filter = 'blur(10px)';
            ctx.drawImage(canvas, x - h, y, w, h, x, y, w, h); // Stretch from above
            ctx.filter = 'none';

            resolve(canvas.toDataURL());
        };
        img.src = URL.createObjectURL(file);
    });
};
