export const captureWebPage = async (url: string): Promise<string> => {
    return new Promise((resolve) => {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
        const proxyUrl = `https://image.thum.io/get/width/1200/crop/800/noanimate/${cleanUrl}`;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            // If proxy fails or CORS block, return placeholder
            const canvas = document.createElement('canvas');
            canvas.width = 800; canvas.height = 400;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, 800, 400);
            ctx.fillStyle = '#ff453a'; ctx.font = 'bold 30px Inter';
            ctx.fillText("CAPTURE FAILED", 50, 80);
            ctx.fillStyle = '#fff'; ctx.font = '16px Inter';
            ctx.fillText("The website might be blocking capture or proxy is down.", 50, 150);
            ctx.fillText(`URL: ${cleanUrl}`, 50, 180);
            resolve(canvas.toDataURL());
        };
        img.src = proxyUrl;
    });
};
