export const generateMockup = async (imageFile: File, deviceType: 'iphone' | 'macbook'): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            if (deviceType === 'iphone') {
                canvas.width = 500; canvas.height = 1000;
                // Draw Phone Frame
                ctx.fillStyle = '#1a1a1a';
                roundRect(ctx, 20, 20, 460, 960, 60);
                ctx.fill();
                ctx.strokeStyle = '#333'; ctx.lineWidth = 5;
                ctx.stroke();
                // Screen
                ctx.fillStyle = '#000';
                roundRect(ctx, 40, 40, 420, 920, 40);
                ctx.fill();
                // Image
                ctx.drawImage(img, 40, 40, 420, 920);
                // Notch
                ctx.fillStyle = '#1a1a1a';
                roundRect(ctx, 150, 40, 200, 30, 15);
                ctx.fill();
            } else {
                canvas.width = 1200; canvas.height = 800;
                // Laptop Body
                ctx.fillStyle = '#d1d1d1';
                roundRect(ctx, 100, 50, 1000, 650, 20);
                ctx.fill();
                // Screen
                ctx.fillStyle = '#000';
                ctx.fillRect(130, 80, 940, 590);
                // Image
                ctx.drawImage(img, 130, 80, 940, 590);
                // Base
                ctx.fillStyle = '#a1a1a1';
                ctx.fillRect(50, 700, 1100, 30);
            }
            resolve(canvas.toDataURL());
        };
        img.src = URL.createObjectURL(imageFile);
    });
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}
