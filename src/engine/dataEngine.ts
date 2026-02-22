import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

export const extractTextOCR = async (file: File): Promise<string> => {
    const worker = await createWorker('ron'); // Using Romanian by default, adaptable
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();
    return text;
};

export const exportToExcel = async (data: any[]): Promise<string> => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
};

export const createSignatureOverlay = async (file: File, signatureDataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject("Canvas context error");

            ctx.drawImage(img, 0, 0);

            const sig = new Image();
            sig.onload = () => {
                // Place signature in bottom right
                const sigWidth = img.width * 0.2;
                const sigHeight = (sig.height / sig.width) * sigWidth;
                ctx.drawImage(sig, img.width - sigWidth - 50, img.height - sigHeight - 50, sigWidth, sigHeight);

                canvas.toBlob((blob) => {
                    if (blob) resolve(URL.createObjectURL(blob));
                    else reject("Blob creation error");
                }, file.type);
            };
            sig.src = signatureDataUrl;
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
