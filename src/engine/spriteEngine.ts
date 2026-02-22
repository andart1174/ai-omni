export const createSeamlessTile = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width * 2; canvas.height = img.height * 2;
            const ctx = canvas.getContext('2d')!;

            // Draw 2x2 grid for tiling preview
            ctx.drawImage(img, 0, 0);
            ctx.drawImage(img, img.width, 0);
            ctx.drawImage(img, 0, img.height);
            ctx.drawImage(img, img.width, img.height);

            resolve(canvas.toDataURL());
        };
        img.src = URL.createObjectURL(file);
    });
};

export const generateSpriteSheet = async (files: File[]): Promise<string> => {
    // Combine multiple frames into one strip
    const images = await Promise.all(files.map(f => {
        return new Promise<HTMLImageElement>(res => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = URL.createObjectURL(f);
        });
    }));

    const canvas = document.createElement('canvas');
    canvas.width = images[0].width * images.length;
    canvas.height = images[0].height;
    const ctx = canvas.getContext('2d')!;

    images.forEach((img, i) => {
        ctx.drawImage(img, i * img.width, 0);
    });

    return canvas.toDataURL();
};
