import { jsPDF } from 'jspdf';

export const SIZE_PRESETS = {
  phone: {
    w: 2532, h: 1170,
    helloScale: 0.075,
    helloY: 0.05,
    nameTop: 0.14,
    nameBottom: 0.90,
    nameMaxW: 0.92,
    brandScale: 0.045,
    brandY: 0.04,
  },
  tablet: {
    w: 2732, h: 2048,
    helloScale: 0.065,
    helloY: 0.055,
    nameTop: 0.13,
    nameBottom: 0.90,
    nameMaxW: 0.90,
    brandScale: 0.035,
    brandY: 0.035,
  },
};

function sanitizeFilename(name) {
  return (name || 'passenger')
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function drawArcs(ctx, width, height, color) {
  const scaleX = (width * 0.4) / 200;
  const scaleY = (height * 0.4) / 200;
  const radii = [50, 80, 110, 140];
  const opacities = [0.6, 0.5, 0.45, 0.35];

  ctx.lineWidth = 2.5 * Math.max(scaleX, scaleY);
  ctx.strokeStyle = color;

  for (let i = 0; i < radii.length; i++) {
    ctx.globalAlpha = opacities[i];

    ctx.beginPath();
    ctx.ellipse(width, 0, radii[i] * scaleX, radii[i] * scaleY, 0, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, height, radii[i] * scaleX, radii[i] * scaleY, 0, 0, 2 * Math.PI);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  if (words.length === 0) return [''];

  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const testLine = currentLine + ' ' + words[i];
    if (ctx.measureText(testLine).width <= maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const lines = wrapLines(ctx, text, maxWidth);
  const totalHeight = lines.length * lineHeight;
  const startY = y - totalHeight / 2 + lineHeight / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], x, startY + i * lineHeight);
  }
}

function fitTextOnCanvas(ctx, text, fontFamily, maxWidth, maxHeight) {
  let lo = 10;
  let hi = 600;

  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    ctx.font = `bold ${mid}px ${fontFamily}`;

    const lines = wrapLines(ctx, text, maxWidth);
    const lineHeight = mid * 1.15;
    const totalHeight = lines.length * lineHeight;
    const widestLine = Math.max(...lines.map((l) => ctx.measureText(l).width));

    if (widestLine > maxWidth || totalHeight > maxHeight) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}

async function renderToCanvas(name, theme, preset) {
  await document.fonts.ready;

  const width = preset.w;
  const height = preset.h;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  drawArcs(ctx, width, height, theme.accent);

  ctx.fillStyle = theme.text;

  const helloSize = height * (preset.helloScale || 0.055);
  ctx.font = `bold ${helloSize}px 'Inter', sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Hello', width / 2, height * (preset.helloY || 0.07));

  const nameMaxW = width * (preset.nameMaxW || 0.85);
  const nameTop = height * (preset.nameTop || 0.17);
  const nameBottom = height * (preset.nameBottom || 0.88);
  const nameMaxH = nameBottom - nameTop;
  const nameCenterY = nameTop + nameMaxH / 2;

  const nameFontSize = fitTextOnCanvas(ctx, name, "'Caveat', cursive", nameMaxW, nameMaxH);
  ctx.font = `bold ${nameFontSize}px 'Caveat', cursive`;
  ctx.fillStyle = theme.text;
  drawWrappedText(ctx, name, width / 2, nameCenterY, nameMaxW, nameFontSize * 1.15);

  const brandSize = height * (preset.brandScale || 0.025);
  const brandY = height - height * (preset.brandY || 0.05);
  ctx.fillStyle = theme.text;
  ctx.textBaseline = 'bottom';

  ctx.font = `bold ${brandSize}px 'Inter', sans-serif`;
  const boltText = 'Bolt ';
  const boltWidth = ctx.measureText(boltText).width;
  ctx.font = `500 ${brandSize}px 'Inter', sans-serif`;
  const chauffeurText = 'Chauffeur';
  const chauffeurWidth = ctx.measureText(chauffeurText).width;
  const brandStartX = (width - boltWidth - chauffeurWidth) / 2;

  ctx.textAlign = 'left';
  ctx.font = `bold ${brandSize}px 'Inter', sans-serif`;
  ctx.fillText(boltText, brandStartX, brandY);
  ctx.font = `500 ${brandSize}px 'Inter', sans-serif`;
  ctx.fillText(chauffeurText, brandStartX + boltWidth, brandY);

  return canvas;
}

export async function downloadAsImage(name, theme, preset) {
  const canvas = await renderToCanvas(name, theme, preset);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `nameboard-${sanitizeFilename(name)}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, 'image/png');
  });
}

export async function downloadAsPDF(name, theme) {
  const preset = SIZE_PRESETS.tablet;
  const canvas = await renderToCanvas(name, theme, preset);
  const imgData = canvas.toDataURL('image/png');

  const pxW = canvas.width;
  const pxH = canvas.height;
  const dpi = 192;
  const mmW = (pxW / dpi) * 25.4;
  const mmH = (pxH / dpi) * 25.4;

  const orientation = mmW > mmH ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'mm', format: [mmW, mmH] });

  pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
  pdf.save(`nameboard-${sanitizeFilename(name)}.pdf`);
}
