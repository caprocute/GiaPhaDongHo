import { toPng, toSvg } from "html-to-image";

export interface ExportOptions {
  fileName?: string;
  pixelRatio?: number;
  backgroundColor?: string;
}

function download(dataUrl: string, fileName: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = fileName;
  a.click();
}

/** Xuất PNG vùng viewport React Flow (client) */
export async function exportTreePng(element: HTMLElement, options: ExportOptions = {}) {
  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: options.pixelRatio ?? 2,
    backgroundColor: options.backgroundColor ?? (getComputedStyle(element).backgroundColor || "#F7F3EA"),
  });
  download(dataUrl, options.fileName ?? "pha-do.png");
  return dataUrl;
}

/** Xuất SVG vùng viewport React Flow (client) */
export async function exportTreeSvg(element: HTMLElement, options: ExportOptions = {}) {
  const dataUrl = await toSvg(element, {
    cacheBust: true,
    backgroundColor: options.backgroundColor ?? (getComputedStyle(element).backgroundColor || "#F7F3EA"),
  });
  download(dataUrl, options.fileName ?? "pha-do.svg");
  return dataUrl;
}
