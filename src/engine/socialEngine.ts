export type VibeFilter = 'vintage' | 'cyberpunk' | 'cinematic' | 'bw' | 'warm';

export const applySocialVibe = async (file: File, vibe: VibeFilter): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width; canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                let r = data[i], g = data[i + 1], b = data[i + 2];

                if (vibe === 'vintage') {
                    data[i] = r * 0.9 + 40;
                    data[i + 1] = g * 0.8 + 20;
                    data[i + 2] = b * 0.6;
                } else if (vibe === 'cyberpunk') {
                    data[i] = r * 1.5;
                    data[i + 2] = b * 1.5 + 50;
                } else if (vibe === 'bw') {
                    const avg = (r + g + b) / 3;
                    data[i] = data[i + 1] = data[i + 2] = avg;
                } else if (vibe === 'warm') {
                    data[i] = r + 30;
                    data[i + 2] = b - 10;
                } else if (vibe === 'cinematic') {
                    data[i] = r * 0.8;
                    data[i + 1] = g * 1.1;
                    data[i + 2] = b * 1.2;
                }
            }
            ctx.putImageData(imageData, 0, 0);

            // Add subtle grain for vintage
            if (vibe === 'vintage') {
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                for (let j = 0; j < 5000; j++) {
                    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1, 1);
                }
            }

            resolve(canvas.toDataURL());
        };
        img.src = URL.createObjectURL(file);
    });
};
