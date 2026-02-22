export const imageToAscii = async (file: File, width: number = 80): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const height = (img.height / img.width) * width * 0.5;
            canvas.width = width; canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const data = ctx.getImageData(0, 0, width, height).data;
            const chars = "@%#*+=-:. ";
            let ascii = "";

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const i = (y * width + x) * 4;
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const charIdx = Math.floor((avg / 255) * (chars.length - 1));
                    ascii += chars[charIdx];
                }
                ascii += "\n";
            }
            resolve(ascii);
        };
        img.src = URL.createObjectURL(file);
    });
};

export const generateHash = async (text: string): Promise<string> => {
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
