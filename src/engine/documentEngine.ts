import { jsPDF } from 'jspdf';

export const mergePDFs = async (files: File[]): Promise<string> => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("OmniConvert - Document Registry", 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    files.forEach((file, index) => {
        if (index > 0) doc.addPage();
        doc.text(`File ${index + 1}: ${file.name}`, 20, 40);
        doc.text(`Size: ${(file.size / 1024).toFixed(2)} KB`, 20, 50);
        doc.text(`Type: ${file.type}`, 20, 60);
    });

    return URL.createObjectURL(doc.output('blob'));
};

export const docToMarkdown = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n');
            const md = lines.map(line => {
                if (line.toUpperCase() === line && line.length > 5) return `# ${line}`;
                if (line.startsWith('-')) return line;
                return line;
            }).join('\n\n');
            resolve(URL.createObjectURL(new Blob([md], { type: 'text/markdown' })));
        };
        reader.readAsText(file);
    });
};
