export const animateKenBurns = async (imageFile: File): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 1280; canvas.height = 720;
            const ctx = canvas.getContext('2d')!;

            // We generate a "panning" preview as a simple demonstration
            // In a real app, this would use an encoder (like ffmpeg.js)
            // For now, we return a high-res wide crop representing the "start" of the pan
            const scale = 1.2;
            ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale, -50, -50, 1280 * scale, 720 * scale);

            resolve(canvas.toDataURL());
        };
        img.src = URL.createObjectURL(imageFile);
    });
};
