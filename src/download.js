import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function sanitizeFilename(name) {
  return (name || 'passenger')
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
}

async function capture(element) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    ignoreElements: (el) => el.hasAttribute?.('data-no-capture'),
  });
}

export async function downloadAsImage(element, name) {
  const canvas = await capture(element);

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

export async function downloadAsPDF(element, name) {
  const canvas = await capture(element);
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
