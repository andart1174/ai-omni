import QRCode from 'qrcode';

export const generateArtisticQR = async (text: string): Promise<string> => {
    return await QRCode.toDataURL(text, {
        margin: 2,
        scale: 10,
        color: {
            dark: '#000000',
            light: '#ffffff'
        }
    });
};

export const extractPalette = async (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.width = 50; canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            const colors: Set<string> = new Set();
            for (let i = 0; i < data.length; i += 40) { // Sample points
                const r = data[i], g = data[i + 1], b = data[i + 2];
                const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                colors.add(hex);
                if (colors.size >= 5) break;
            }
            resolve(Array.from(colors));
        };
        img.src = URL.createObjectURL(file);
    });
};
