export const renderCsvChart = async (csvData: string): Promise<string> => {
    const lines = csvData.split('\n').filter(l => l.trim().length > 0);
    const data = lines.map(line => {
        const parts = line.split(',');
        return { label: parts[0], value: parseFloat(parts[1]) || 0 };
    });

    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 500;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, 800, 500);

    const margin = 60;
    const chartW = 800 - margin * 2;
    const chartH = 500 - margin * 2;
    const maxVal = Math.max(...data.map(d => d.value), 1);
    const barW = chartW / data.length - 10;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    for (let i = 0; i <= 5; i++) {
        const y = margin + (chartH / 5) * i;
        ctx.moveTo(margin, y);
        ctx.lineTo(margin + chartW, y);
    }
    ctx.stroke();

    // Bars
    data.forEach((d, i) => {
        const h = (d.value / maxVal) * chartH;
        const x = margin + i * (barW + 10);
        const y = margin + chartH - h;

        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#007aff');
        grad.addColorStop(1, '#5856d6');

        ctx.fillStyle = grad;
        drawRoundRect(ctx, x, y, barW, h, 8);
        ctx.fill();

        // Label
        ctx.fillStyle = '#a1a1a1';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(d.label.substring(0, 5), x + barW / 2, margin + chartH + 20);
    });

    return canvas.toDataURL();
};

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}
