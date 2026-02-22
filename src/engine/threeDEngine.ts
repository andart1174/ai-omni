export interface ThreeDSettings {
    zScale: number;
    res: number;
    invert: boolean;
}

export const imageTo3D = async (file: File, settings: ThreeDSettings = { zScale: 4, res: 100, invert: false }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const res = settings.res;
            canvas.width = res; canvas.height = res;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, res, res);
            const imageData = ctx.getImageData(0, 0, res, res).data;

            const numFaces = (res - 1) * (res - 1) * 2;
            const buffer = new ArrayBuffer(80 + 4 + numFaces * 50);
            const view = new DataView(buffer);
            view.setUint32(80, numFaces, true);

            let offset = 84;
            const size = 15;
            const scale = size / res;
            const centerX = size / 2;
            const centerY = size / 2;

            for (let y = 0; y < res - 1; y++) {
                for (let x = 0; x < res - 1; x++) {
                    const getZ = (px: number, py: number) => {
                        const idx = (py * res + px) * 4;
                        const avg = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
                        const depth = settings.invert ? (255 - avg) : avg;
                        return (depth / 255) * settings.zScale;
                    };

                    const v1 = [x * scale - centerX, y * scale - centerY, getZ(x, y)];
                    const v2 = [(x + 1) * scale - centerX, y * scale - centerY, getZ(x + 1, y)];
                    const v3 = [x * scale - centerX, (y + 1) * scale - centerY, getZ(x, y + 1)];
                    const v4 = [(x + 1) * scale - centerX, (y + 1) * scale - centerY, getZ(x + 1, y + 1)];

                    // Triangle 1
                    offset += 12;
                    [v1, v2, v3].forEach(v => {
                        view.setFloat32(offset, v[0], true); offset += 4;
                        view.setFloat32(offset, v[1], true); offset += 4;
                        view.setFloat32(offset, v[2], true); offset += 4;
                    });
                    offset += 2;

                    // Triangle 2
                    offset += 12;
                    [v2, v4, v3].forEach(v => {
                        view.setFloat32(offset, v[0], true); offset += 4;
                        view.setFloat32(offset, v[1], true); offset += 4;
                        view.setFloat32(offset, v[2], true); offset += 4;
                    });
                    offset += 2;
                }
            }
            resolve(URL.createObjectURL(new Blob([buffer], { type: 'model/stl' })));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

export const generateOBJ = async (file: File, settings: ThreeDSettings = { zScale: 4, res: 80, invert: false }): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const res = settings.res;
            canvas.width = res; canvas.height = res;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, res, res);
            const imageData = ctx.getImageData(0, 0, res, res).data;

            let obj = "# OmniConvert 3D OBJ Export\n";
            const size = 15;
            const scale = size / res;
            const centerX = size / 2;
            const centerY = size / 2;

            for (let y = 0; y < res; y++) {
                for (let x = 0; x < res; x++) {
                    const idx = (y * res + x) * 4;
                    const avg = (imageData[idx] + imageData[idx + 1] + imageData[idx + 2]) / 3;
                    const depth = settings.invert ? (255 - avg) : avg;
                    const z = (depth / 255) * settings.zScale;
                    obj += `v ${x * scale - centerX} ${y * scale - centerY} ${z}\n`;
                }
            }

            for (let y = 0; y < res - 1; y++) {
                for (let x = 0; x < res - 1; x++) {
                    const i1 = (y * res + x) + 1;
                    const i2 = (y * res + (x + 1)) + 1;
                    const i3 = ((y + 1) * res + x) + 1;
                    const i4 = ((y + 1) * res + (x + 1)) + 1;
                    obj += `f ${i1} ${i2} ${i3}\n`;
                    obj += `f ${i2} ${i4} ${i3}\n`;
                }
            }

            resolve(URL.createObjectURL(new Blob([obj], { type: 'text/plain' })));
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
