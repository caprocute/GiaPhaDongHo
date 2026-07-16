import { toJpeg, toPng, toSvg } from "html-to-image";

export interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;
  width?: number;
  height?: number;
  style?: Partial<CSSStyleDeclaration> | Record<string, string>;
}

/** Lấy màu solid từ token — html-to-image không resolve `var()` / `color-mix()`. */
export function resolveExportBackground(fallback = "rgb(247, 243, 234)"): string {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--color-surface-page")
    .trim();
  if (!raw) return fallback;
  // Ép qua canvas/computed nếu là var lồng nhau
  const probe = document.createElement("div");
  probe.style.cssText = `position:fixed;left:-9999px;background:${raw}`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).backgroundColor || fallback;
  document.body.removeChild(probe);
  return resolved === "rgba(0, 0, 0, 0)" || resolved === "transparent" ? fallback : resolved;
}

function downloadDataUrl(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function exportFilter(node: HTMLElement): boolean {
  if (!(node instanceof Element)) return true;
  const cls = typeof node.className === "string" ? node.className : "";
  if (cls.includes("react-flow__controls")) return false;
  if (cls.includes("react-flow__minimap")) return false;
  if (cls.includes("react-flow__attribution")) return false;
  if (cls.includes("react-flow__panel")) return false;
  return true;
}

function baseOptions(options: ExportOptions) {
  return {
    cacheBust: true,
    skipFonts: true,
    filter: exportFilter,
    backgroundColor: options.backgroundColor ?? resolveExportBackground(),
    pixelRatio: options.pixelRatio ?? 2,
    width: options.width,
    height: options.height,
    style: options.style as Record<string, string> | undefined,
  };
}

/** Xuất PNG viewport phả đồ */
export async function exportTreePng(element: HTMLElement, options: ExportOptions = {}) {
  const dataUrl = await toPng(element, baseOptions(options));
  downloadDataUrl(dataUrl, options.fileName ?? "pha-do.png");
  return dataUrl;
}

/** Xuất SVG viewport phả đồ */
export async function exportTreeSvg(element: HTMLElement, options: ExportOptions = {}) {
  const dataUrl = await toSvg(element, baseOptions(options));
  downloadDataUrl(dataUrl, options.fileName ?? "pha-do.svg");
  return dataUrl;
}

/**
 * Xuất PDF 1 trang: JPEG → PDF tối giản (không thêm dependency).
 * Ấn phẩm fidelity cao sẽ qua pdf-render service sau (TK-04).
 */
export async function exportTreePdf(element: HTMLElement, options: ExportOptions = {}) {
  const bg = options.backgroundColor ?? resolveExportBackground();
  const dataUrl = await toJpeg(element, {
    ...baseOptions({ ...options, backgroundColor: bg }),
    quality: 0.92,
  });

  const img = await loadImage(dataUrl);
  const pageW = 842; // A4 landscape points (~297mm)
  const pageH = 595;
  const margin = 24;
  const maxW = pageW - margin * 2;
  const maxH = pageH - margin * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const drawW = img.width * scale;
  const drawH = img.height * scale;
  const x = (pageW - drawW) / 2;
  const y = (pageH - drawH) / 2;

  const jpegBytes = dataUrlToUint8Array(dataUrl);
  const pdf = buildJpegPdf({
    pageW,
    pageH,
    imgW: img.width,
    imgH: img.height,
    drawX: x,
    drawY: y,
    drawW,
    drawH,
    jpeg: jpegBytes,
  });

  const copy = new Uint8Array(pdf.byteLength);
  copy.set(pdf);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  downloadDataUrl(url, options.fileName ?? "pha-do.pdf");
  setTimeout(() => URL.revokeObjectURL(url), 2_000);
  return dataUrl;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không đọc được ảnh xuất."));
    img.src = src;
  });
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  if (!base64) throw new Error("JPEG rỗng.");
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function buildJpegPdf(opts: {
  pageW: number;
  pageH: number;
  imgW: number;
  imgH: number;
  drawX: number;
  drawY: number;
  drawW: number;
  drawH: number;
  jpeg: Uint8Array;
}): Uint8Array {
  const { pageW, pageH, imgW, imgH, drawX, drawY, drawW, drawH, jpeg } = opts;
  // PDF y gốc dưới-trái
  const pdfY = pageH - drawY - drawH;
  const content = `q\n${drawW.toFixed(2)} 0 0 ${drawH.toFixed(2)} ${drawX.toFixed(2)} ${pdfY.toFixed(2)} cm\n/Im0 Do\nQ\n`;

  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [0];
  let offset = 0;

  const push = (s: string | Uint8Array) => {
    const bytes = typeof s === "string" ? encoder.encode(s) : s;
    parts.push(bytes);
    offset += bytes.length;
  };

  const startObj = (n: number) => {
    offsets[n] = offset;
  };

  push("%PDF-1.4\n");

  startObj(1);
  push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  startObj(2);
  push("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

  startObj(3);
  push(
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>\nendobj\n`,
  );

  startObj(4);
  push(`4 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`);

  startObj(5);
  push(
    `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  push(jpeg);
  push("\nendstream\nendobj\n");

  const xrefStart = offset;
  push(`xref\n0 6\n`);
  push("0000000000 65535 f \n");
  for (let i = 1; i <= 5; i++) {
    push(`${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`);
  }
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
