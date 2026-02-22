import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

export type PrintFormat = 'card-85-55' | 'epub-to-pdf' | 'print-sheet';

export const convertToPrint = async (
    file: File,
    format: PrintFormat,
    options: { bleed?: number; margin?: number } = { bleed: 3, margin: 10 }
): Promise<string> => {
    const pdf = new jsPDF('p', 'mm', 'a4');

    if (format === 'card-85-55') {
        const imgData = await fileToDataUrl(file);
        const cardWidth = 85;
        const cardHeight = 55;
        const bleed = options.bleed || 3;
        const fullWidth = cardWidth + (bleed * 2);
        const fullHeight = cardHeight + (bleed * 2);

        const startX = (210 - (fullWidth * 2)) / 2;
        const startY = (297 - (fullHeight * 4)) / 2;

        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 2; col++) {
                const x = startX + (col * fullWidth);
                const y = startY + (row * fullHeight);

                pdf.addImage(imgData, 'JPEG', x, y, fullWidth, fullHeight);
                pdf.setDrawColor(200, 200, 200);
                pdf.line(x + bleed, y, x + bleed, y + 5);
                pdf.line(x, y + bleed, x + 5, y + bleed);
                pdf.line(x + fullWidth - bleed, y, x + fullWidth - bleed, y + 5);
                pdf.line(x + fullWidth - 5, y + bleed, x + fullWidth, y + bleed);
                pdf.line(x + bleed, y + fullHeight - 5, x + bleed, y + fullHeight);
                pdf.line(x, y + fullHeight - bleed, x + 5, y + fullHeight - bleed);
                pdf.line(x + fullWidth - bleed, y + fullHeight - 5, x + fullWidth - bleed, y + fullHeight);
                pdf.line(x + fullWidth - 5, y + fullHeight - bleed, x + fullWidth, y + fullHeight - bleed);
            }
        }
    } else if (format === 'epub-to-pdf') {
        try {
            const zip = await JSZip.loadAsync(file);
            let fullText = "";
            let title = file.name.replace('.epub', '');

            // 1. Try to find the manifest or table of contents to order chapters
            // For a robust MVP, we'll scan all .xhtml or .html files in the archive
            const textFiles = Object.keys(zip.files).filter(name =>
                name.endsWith('.xhtml') || name.endsWith('.html') || name.endsWith('.htm')
            ).sort(); // Sort to get some logical order

            if (textFiles.length === 0) throw new Error("Nu s-au găsit capitole în format text în interiorul arhivei EPUB.");

            // 2. Extract and clean text from each file
            for (const fileName of textFiles) {
                const content = await zip.files[fileName].async("string");
                // Remove HTML tags using a DOMParser for safety
                const parser = new DOMParser();
                const doc = parser.parseFromString(content, 'text/html');
                const text = doc.body.innerText || doc.body.textContent || "";
                fullText += text.trim() + "\n\n--- PAGINĂ NOUĂ ---\n\n";
            }

            // 3. Generate PDF pages
            pdf.setFontSize(16);
            pdf.text(title, 20, 20);
            pdf.setFontSize(10);

            const lines = pdf.splitTextToSize(fullText, 170);
            let cursorY = 35;
            const pageHeight = 280;

            for (let i = 0; i < lines.length; i++) {
                if (cursorY > pageHeight) {
                    pdf.addPage();
                    cursorY = 20;
                }
                pdf.text(lines[i], 20, cursorY);
                cursorY += 5;
            }
        } catch (err: any) {
            throw new Error(`EPUB Parsing Error: ${err.message}`);
        }
    }

    const blob = pdf.output('blob');
    return URL.createObjectURL(blob);
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
