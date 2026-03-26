import { jsPDF } from 'jspdf';

const LOGO_SVG_PATHS = [
  { d: 'M42.5636 31.8059H37.3204V11.0965L42.5636 10.0112V31.8059ZM27.645 26.6817C29.0957 26.6817 30.2609 25.5405 30.2609 24.1308V24.1196C30.2609 22.7099 29.0957 21.5575 27.645 21.5575C26.1942 21.5575 25.0291 22.6987 25.0291 24.1196C25.0291 25.5405 26.1942 26.6817 27.645 26.6817ZM27.645 16.2095C32.1114 16.2095 35.7212 19.745 35.7212 24.1308C35.7212 28.4942 32.1 32.0409 27.6336 32.0409C23.1671 32.0409 19.5574 28.483 19.5574 24.1196C19.5574 19.7562 23.1785 16.2095 27.645 16.2095ZM27.645 33.8758C26.1942 33.8758 25.0291 35.0282 25.0291 36.4379C25.0291 37.8476 26.1942 39 27.645 39C29.0957 39 30.2609 37.8588 30.2609 36.4379C30.2609 35.017 29.0957 33.8758 27.645 33.8758ZM11.1728 26.6817H11.2642C12.1666 26.6593 12.8748 25.9209 12.852 25.037C12.8292 24.1532 12.0752 23.4595 11.1728 23.4819H7.24323V26.6817H11.1728ZM7.24323 15.1354V18.3353H10.1561C11.0586 18.3353 11.7896 17.6192 11.7896 16.7353C11.7896 15.8515 11.0586 15.1354 10.1561 15.1354H7.24323ZM15.9934 20.282C17.2956 21.5463 18.0267 23.2693 18.0267 25.0482C18.0381 28.7739 14.9539 31.7948 11.1614 31.7948H2V10H10.1447C11.4241 10 12.6692 10.3468 13.7544 11.0069C16.9872 12.9649 17.9924 17.1157 15.9934 20.282ZM52.4561 21.6246V16.4892H49.8288V12.5733L44.5969 13.6586V26.9279C44.5969 30.0606 46.5846 31.8619 49.5089 32.0073C49.5317 32.0073 49.5774 32.0185 49.6003 32.0185H49.646C49.7145 32.0185 49.7716 32.0297 49.8402 32.0297H49.9087C50.7997 32.0297 51.6793 31.8059 52.4675 31.392V27.6103C52.0905 27.711 51.6907 27.767 51.3023 27.7558C50.2514 27.7558 49.8516 26.8607 49.8516 25.6412V21.6134L52.4561 21.6246Z', fillRule: 'evenodd' },
  { d: 'M59.6379 21.6052C59.6379 15.0836 63.8073 11.0547 69.5429 11.0547C74.4251 11.0547 78.0623 14.014 78.7202 18.5766H74.3692C73.8791 16.1655 72.0754 14.7815 69.5989 14.7815C66.06 14.7815 63.9752 17.4264 63.9752 21.6052C63.9752 25.784 66.0451 28.401 69.5989 28.401C72.0605 28.401 73.8517 27.0304 74.3829 24.6328H78.7191C78.0611 29.1819 74.424 32.1278 69.5417 32.1278C63.8199 32.1278 59.6367 28.0855 59.6367 21.6052H59.6379Z' },
  { d: 'M84.7722 31.7988H80.645V11.3836H84.7722V19.5085C85.766 17.9187 87.2339 17.0281 89.3186 17.0281C92.4669 17.0281 94.4945 19.0834 94.4945 22.7419V31.7988H90.381V23.4815C90.381 21.5358 89.3872 20.5076 87.6669 20.5076C85.9465 20.5076 84.7711 21.5079 84.7711 23.7556V31.7988H84.7722Z' },
  { d: 'M96.3793 27.7162C96.3793 24.4549 99.0649 23.524 102.143 23.2499C104.844 22.9892 105.794 22.8661 105.794 21.9341V21.8379C105.794 20.7694 104.885 20.0288 103.374 20.0288C101.862 20.0288 100.827 20.7963 100.729 21.9062H96.8545C97.0361 18.9189 99.443 17.0281 103.499 17.0281C107.556 17.0281 109.864 18.8921 109.864 21.9878V31.7988H105.835V29.757H105.779C104.996 31.1678 103.723 32.045 101.457 32.045C98.5052 32.045 96.3782 30.6062 96.3782 27.7151L96.3793 27.7162ZM105.822 26.5101V25.0579C105.346 25.3186 104.185 25.5099 102.856 25.7158C101.443 25.9216 100.324 26.4553 100.324 27.6066C100.324 28.6337 101.219 29.2367 102.604 29.2367C104.59 29.2367 105.822 28.072 105.822 26.5101Z' },
  { d: 'M112.318 26.3871V17.3302H116.445V25.6475C116.445 27.5932 117.439 28.6214 119.159 28.6214C120.88 28.6214 122.055 27.6211 122.055 25.3745V17.3313H126.169V31.8011H122.126V29.5265C121.133 31.1712 119.636 32.102 117.51 32.102C114.363 32.102 112.319 30.0468 112.319 26.3882L112.318 26.3871Z' },
  { d: 'M137.197 20.4953H134.175V31.8H130.063V20.4953H127.391V17.3302H130.063V15.4528C130.063 12.753 131.671 11.3836 134.862 11.3836H137.198V14.5488H135.798C134.609 14.5488 134.175 14.9873 134.175 16.1386V17.3302H137.197V20.4953Z' },
  { d: 'M147.819 20.4953H144.797V31.8H140.684V20.4953H138.012V17.3302H140.684V15.4528C140.684 12.753 142.292 11.3836 145.483 11.3836H147.819V14.5488H146.42C145.23 14.5488 144.796 14.9873 144.796 16.1386V17.3302H147.818V20.4953H147.819Z' },
  { d: 'M148.422 24.5779C148.422 20.1664 151.43 17.0012 155.669 17.0012C159.908 17.0012 162.943 20.0847 162.943 24.4963V25.5782H152.437C152.507 27.7151 153.766 29.0991 155.935 29.0991C157.543 29.0991 158.649 28.373 159.027 27.2497H162.79C162.244 30.1273 159.391 32.1278 155.809 32.1278C151.333 32.1278 148.423 28.976 148.423 24.5779H148.422ZM159.055 23.0026C158.845 21.1935 157.614 20.0702 155.753 20.0702C153.893 20.0702 152.69 21.1935 152.466 23.0026H159.055Z' },
  { d: 'M164.71 17.3302H168.838V25.6475C168.838 27.5932 169.831 28.6214 171.552 28.6214C173.272 28.6214 174.447 27.6211 174.447 25.3745V17.3313H178.56V31.8011H174.517V29.5265C173.523 31.1712 172.027 32.102 169.901 32.102C166.754 32.102 164.71 30.0468 164.71 26.3882V17.3302Z' },
  { d: 'M181.159 17.3302H185.132V19.7961H185.174C185.72 18.0563 186.838 17.2339 188.784 17.2339C189.259 17.2339 189.664 17.2474 190 17.2619V20.7012C189.693 20.6878 188.923 20.6329 188.224 20.6329C186.531 20.6329 185.286 21.7842 185.286 23.9626V31.8H181.159V17.3302Z' },
];

function buildLogoSvgDataUrl(fill) {
  const paths = LOGO_SVG_PATHS.map((p) => {
    const fr = p.fillRule ? ` fill-rule="${p.fillRule}" clip-rule="${p.fillRule}"` : '';
    return `<path d="${p.d}" fill="${fill}"${fr}/>`;
  }).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 48">${paths}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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

export function sanitizeFilename(name) {
  const cleaned = (name || 'passenger')
    .trim()
    .replace(/[/\\:*?"<>|]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  return cleaned || 'passenger';
}

const CANVAS_ARC_FRACTIONS = [0.31, 0.38, 0.45, 0.52];

function drawArcs(ctx, width, height, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, height * 0.014);
  ctx.globalAlpha = 0.65;

  for (const frac of CANVAS_ARC_FRACTIONS) {
    const radius = height * frac;

    ctx.beginPath();
    ctx.arc(width, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, height, radius, 0, Math.PI * 2);
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

  const logoHeight = height * (preset.brandScale || 0.025) * 2;
  const logoAspect = 192 / 48;
  const logoWidth = logoHeight * logoAspect;
  const logoX = (width - logoWidth) / 2;
  const logoY = height - height * (preset.brandY || 0.05) - logoHeight;

  try {
    const logoImg = await loadImage(buildLogoSvgDataUrl(theme.text));
    ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);
  } catch {
    ctx.fillStyle = theme.text;
    ctx.font = `bold ${logoHeight * 0.5}px 'Inter', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Bolt Chauffeur', width / 2, logoY + logoHeight);
  }

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
