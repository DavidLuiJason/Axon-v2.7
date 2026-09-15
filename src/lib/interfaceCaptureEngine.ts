import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ScreenId } from '../types';
import {
  AXON_INTERFACES,
  InterfaceMetadata,
  getInterfaceById,
  getSafeInterfaceFileName,
} from './interfaceRegistry';
import { sanitizeClonedTreeForCapture } from './colorConverter';

export interface GeneratedResultFile {
  id: string;
  interfaceName: string;
  category: string;
  route: string;
  status: 'success' | 'failed';
  errorMessage?: string;
  fileName: string;
  fileFormat: 'PNG' | 'JPG' | 'PDF';
  fileType: string;
  fileSize: string;
  dimensions?: string;
  dataUrl?: string;
  capturedAt: string;
}

export interface CapturedInterfaceResult {
  id: string;
  name: string;
  category: string;
  route: ScreenId;
  canvas: HTMLCanvasElement;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  formattedSize: string;
  capturedAt: string;
  format: 'png' | 'jpeg';
  isSuccess: boolean;
  error?: string;
}

export interface CaptureEngineOptions {
  scale?: number;
  fullHeight?: boolean;
  format?: 'png' | 'jpeg';
  quality?: number;
  onProgress?: (progress: { current: number; total: number; interfaceName: string; percent: number }) => void;
}

export interface MultiCaptureReport {
  results: CapturedInterfaceResult[];
  successfulCount: number;
  failedCount: number;
  failures: Array<{ name: string; route: string; error: string }>;
  totalDurationMs: number;
  combinedLongImage?: {
    canvas: HTMLCanvasElement;
    dataUrl: string;
    width: number;
    height: number;
    filename: string;
  };
  pdfDocument?: {
    blob: Blob;
    dataUrl: string;
    filename: string;
  };
}

// Stage controller types for offscreen rendering
type StageRenderRequester = (route: ScreenId, isFull: boolean) => Promise<HTMLElement | null>;
let globalStageRequester: StageRenderRequester | null = null;

export function registerOffscreenStageRequester(requester: StageRenderRequester | null): void {
  globalStageRequester = requester;
}

/**
 * Formats byte size into human readable string.
 */
function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Captures an HTMLElement using html2canvas with retina scaling and crisp typography rendering.
 */
export async function captureDomElement(
  element: HTMLElement,
  options: { scale?: number; fullHeight?: boolean; format?: 'png' | 'jpeg'; quality?: number } = {}
): Promise<HTMLCanvasElement> {
  const scale = options.scale ?? 2;
  const isFull = options.fullHeight ?? false;

  // If full interface is requested, locate scrollable child and expand height temporarily
  let restoreStyles: (() => void) | null = null;
  if (isFull) {
    const scrollContainer =
      (element.querySelector('.overflow-y-auto, [id$="-screen"]') as HTMLElement) ||
      (element.scrollHeight > element.clientHeight ? element : null);

    if (scrollContainer) {
      const prevOverflow = scrollContainer.style.overflow;
      const prevHeight = scrollContainer.style.height;
      const prevMaxHeight = scrollContainer.style.maxHeight;

      scrollContainer.style.overflow = 'visible';
      scrollContainer.style.height = 'auto';
      scrollContainer.style.maxHeight = 'none';

      restoreStyles = () => {
        scrollContainer.style.overflow = prevOverflow;
        scrollContainer.style.height = prevHeight;
        scrollContainer.style.maxHeight = prevMaxHeight;
      };
    }
  }

  try {
    // Wait one animation frame for reflow to settle
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#000000',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth || 430,
      windowHeight: isFull ? Math.max(element.scrollHeight, 800) : element.clientHeight || 932,
      onclone: (clonedDoc, clonedElement) => {
        sanitizeClonedTreeForCapture(clonedDoc, clonedElement, element);
      },
    });

    return canvas;
  } finally {
    if (restoreStyles) {
      restoreStyles();
    }
  }
}

/**
 * Captures the currently active live interface visible on the screen.
 */
export async function captureLiveCurrentInterface(
  currentScreen: ScreenId,
  options: CaptureEngineOptions = {}
): Promise<CapturedInterfaceResult> {
  const format = options.format || 'png';
  const quality = options.quality ?? 0.92;
  const meta = getInterfaceById(currentScreen) || {
    id: currentScreen,
    name: 'Current View',
    route: currentScreen,
    category: 'Core',
    description: 'Active screen',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: [],
  };

  // Find the live container in DOM
  const targetElement =
    (document.getElementById(`screen-container-${currentScreen}`) as HTMLElement) ||
    (document.getElementById('app-main-viewport') as HTMLElement) ||
    (document.getElementById('axon-app-root') as HTMLElement) ||
    document.body;

  try {
    const canvas = await captureDomElement(targetElement, {
      scale: options.scale ?? 2,
      fullHeight: options.fullHeight ?? false,
      format,
      quality,
    });

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(mime, quality);
    const approxBytes = Math.round((dataUrl.length * 3) / 4);

    return {
      id: meta.id,
      name: meta.name,
      category: meta.category,
      route: meta.route,
      canvas,
      dataUrl,
      width: canvas.width,
      height: canvas.height,
      sizeBytes: approxBytes,
      formattedSize: formatByteSize(approxBytes),
      capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      format,
      isSuccess: true,
    };
  } catch (err: any) {
    console.error(`Failed to capture current interface (${currentScreen}):`, err);
    throw new Error(`Unable to capture current interface: ${err?.message || 'Rendering error'}`);
  }
}

/**
 * Captures a specific interface in the background without navigating the user's active screen.
 */
export async function captureInterfaceById(
  interfaceIdOrRoute: string,
  options: CaptureEngineOptions = {}
): Promise<CapturedInterfaceResult> {
  const format = options.format || 'png';
  const quality = options.quality ?? 0.92;
  const meta = getInterfaceById(interfaceIdOrRoute);

  if (!meta) {
    throw new Error(`Unrecognized interface identifier: "${interfaceIdOrRoute}".`);
  }

  // 1. If offscreen stage requester is registered, request background rendering
  if (globalStageRequester) {
    try {
      const stageElement = await globalStageRequester(meta.route, options.fullHeight ?? false);
      if (stageElement) {
        const canvas = await captureDomElement(stageElement, {
          scale: options.scale ?? 2,
          fullHeight: options.fullHeight ?? false,
          format,
          quality,
        });

        const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const dataUrl = canvas.toDataURL(mime, quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);

        return {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          route: meta.route,
          canvas,
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeBytes: approxBytes,
          formattedSize: formatByteSize(approxBytes),
          capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          format,
          isSuccess: true,
        };
      }
    } catch (err: any) {
      console.warn(`Stage rendering failed for ${meta.name}, falling back to live container lookup:`, err);
    }
  }

  // 2. Fallback: Check if element exists in visited screens in DOM
  const existingElement = document.getElementById(`screen-container-${meta.route}`);
  if (existingElement) {
    const prevVisibility = existingElement.style.visibility;
    existingElement.style.visibility = 'visible';
    try {
      const canvas = await captureDomElement(existingElement, {
        scale: options.scale ?? 2,
        fullHeight: options.fullHeight ?? false,
        format,
        quality,
      });

      const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mime, quality);
      const approxBytes = Math.round((dataUrl.length * 3) / 4);

      return {
        id: meta.id,
        name: meta.name,
        category: meta.category,
        route: meta.route,
        canvas,
        dataUrl,
        width: canvas.width,
        height: canvas.height,
        sizeBytes: approxBytes,
        formattedSize: formatByteSize(approxBytes),
        capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        format,
        isSuccess: true,
      };
    } finally {
      existingElement.style.visibility = prevVisibility;
    }
  }

  throw new Error(`Interface "${meta.name}" could not be staged for background capture.`);
}

/**
 * Captures all registered AXON interfaces in deterministic hierarchy order.
 * Follows Requirement 15: Continues if one interface fails, reporting successes and failures at the end.
 */
export async function captureAllInterfaces(
  options: CaptureEngineOptions = {}
): Promise<MultiCaptureReport> {
  const startTime = Date.now();
  const results: CapturedInterfaceResult[] = [];
  const failures: Array<{ name: string; route: string; error: string }> = [];

  const targets = AXON_INTERFACES.filter((i) => i.isAvailable);
  const total = targets.length;

  for (let i = 0; i < total; i++) {
    const meta = targets[i];
    options.onProgress?.({
      current: i + 1,
      total,
      interfaceName: meta.name,
      percent: Math.round(((i + 1) / total) * 100),
    });

    try {
      const result = await captureInterfaceById(meta.id, options);
      results.push(result);
    } catch (err: any) {
      console.warn(`Interface capture failed for "${meta.name}":`, err);
      failures.push({
        name: meta.name,
        route: meta.route,
        error: err?.message || 'Unknown capture error',
      });
    }

    // Small yield to keep UI responsive and prevent frame freezing
    await new Promise((r) => setTimeout(r, 40));
  }

  const duration = Date.now() - startTime;
  return {
    results,
    successfulCount: results.length,
    failedCount: failures.length,
    failures,
    totalDurationMs: duration,
  };
}

/**
 * Stitches an array of captured interface canvases vertically into a continuous long image.
 */
export async function stitchCanvasesVertically(
  captures: CapturedInterfaceResult[],
  options: { gap?: number; banner?: boolean; format?: 'png' | 'jpeg'; quality?: number } = {}
): Promise<{ canvas: HTMLCanvasElement; dataUrl: string; width: number; height: number; filename: string }> {
  if (captures.length === 0) {
    throw new Error('No captures provided to stitch.');
  }

  const gap = options.gap ?? 28;
  const hasBanner = options.banner ?? true;
  const bannerHeight = hasBanner ? 56 : 0;
  const format = options.format || 'png';
  const quality = options.quality ?? 0.92;

  // Compute maximum width across all canvases
  const maxWidth = Math.max(...captures.map((c) => c.canvas.width), 800);

  // Compute total canvas height
  let totalHeight = 40; // Top margin
  for (const cap of captures) {
    totalHeight += bannerHeight + cap.canvas.height + gap;
  }
  totalHeight += 40; // Bottom margin

  const master = document.createElement('canvas');
  master.width = maxWidth;
  master.height = totalHeight;
  const ctx = master.getContext('2d');
  if (!ctx) throw new Error('Failed to create canvas 2D context.');

  // Render solid dark background
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, master.width, master.height);

  let currentY = 40;

  for (let i = 0; i < captures.length; i++) {
    const cap = captures[i];

    if (hasBanner) {
      // Header banner card background
      ctx.fillStyle = '#171717';
      ctx.fillRect(0, currentY, maxWidth, bannerHeight);

      // Top divider line
      ctx.fillStyle = '#262626';
      ctx.fillRect(0, currentY, maxWidth, 1);

      // Interface Number & Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${i + 1}. ${cap.name}`, 24, currentY + 34);

      // Category Badge
      ctx.font = '600 14px monospace';
      ctx.fillStyle = '#a3a3a3';
      ctx.textAlign = 'right';
      ctx.fillText(`[${cap.category.toUpperCase()}] • ${cap.width}x${cap.height}px`, maxWidth - 24, currentY + 34);

      currentY += bannerHeight;
    }

    // Draw the actual captured interface canvas centered
    const offsetX = Math.max(0, Math.floor((maxWidth - cap.canvas.width) / 2));
    ctx.drawImage(cap.canvas, offsetX, currentY);

    currentY += cap.canvas.height + gap;
  }

  const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const dataUrl = master.toDataURL(mime, quality);

  return {
    canvas: master,
    dataUrl,
    width: master.width,
    height: master.height,
    filename: getSafeInterfaceFileName('All_Interfaces', format === 'jpeg' ? 'jpg' : 'png', true),
  };
}

/**
 * Compiles captures into a multi-page PDF document using jsPDF.
 * Creates one page per captured interface with crisp native dimensions.
 */
export async function exportCapturesToPdf(
  captures: CapturedInterfaceResult[],
  customFilename?: string
): Promise<{ blob: Blob; dataUrl: string; filename: string }> {
  if (captures.length === 0) {
    throw new Error('No captures provided for PDF export.');
  }

  const filename = customFilename || 'AXON_Interface_Documentation.pdf';

  // Instantiate jsPDF with first page dimensions
  const first = captures[0];
  const isFirstLandscape = first.canvas.width > first.canvas.height;

  const pdf = new jsPDF({
    orientation: isFirstLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [first.canvas.width, first.canvas.height],
    hotfixes: ['px_scaling'],
  });

  // Add first page image
  const firstImgData = first.canvas.toDataURL('image/png');
  pdf.addImage(firstImgData, 'PNG', 0, 0, first.canvas.width, first.canvas.height, undefined, 'FAST');

  // Add remaining pages
  for (let i = 1; i < captures.length; i++) {
    const item = captures[i];
    const isLandscape = item.canvas.width > item.canvas.height;
    pdf.addPage([item.canvas.width, item.canvas.height], isLandscape ? 'landscape' : 'portrait');
    const imgData = item.canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, item.canvas.width, item.canvas.height, undefined, 'FAST');
  }

  const blob = pdf.output('blob');
  const dataUrl = pdf.output('dataurlstring');

  return {
    blob,
    dataUrl,
    filename,
  };
}

/**
 * Triggers a browser download for a dataUrl.
 */
export function triggerCaptureDownload(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function buildResultFileFromCapture(
  result: CapturedInterfaceResult,
  formatOverride?: 'png' | 'jpg'
): GeneratedResultFile {
  const ext = formatOverride || (result.format === 'jpeg' ? 'jpg' : 'png');
  const fileName = getSafeInterfaceFileName(result.name, ext);
  return {
    id: `${result.id}-${ext}`,
    interfaceName: result.name,
    category: result.category,
    route: result.route,
    status: result.isSuccess ? 'success' : 'failed',
    errorMessage: result.error,
    fileName,
    fileFormat: ext.toUpperCase() as 'PNG' | 'JPG',
    fileType: ext === 'jpg' ? 'image/jpeg' : 'image/png',
    fileSize: result.formattedSize,
    dimensions: `${result.width} × ${result.height} px`,
    dataUrl: result.dataUrl,
    capturedAt: result.capturedAt,
  };
}

export function buildResultFileFromPdf(
  pdfDoc: { dataUrl: string; filename: string; blob?: Blob },
  interfaceName: string,
  category = 'Documentation',
  route = 'all',
  pageCount?: number
): GeneratedResultFile {
  const approxBytes = Math.round((pdfDoc.dataUrl.length * 3) / 4);
  return {
    id: `pdf-${pdfDoc.filename}`,
    interfaceName,
    category,
    route,
    status: 'success',
    fileName: pdfDoc.filename,
    fileFormat: 'PDF',
    fileType: 'application/pdf',
    fileSize: formatByteSize(approxBytes),
    dimensions: pageCount ? `${pageCount} page${pageCount > 1 ? 's' : ''}` : 'Document',
    dataUrl: pdfDoc.dataUrl,
    capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function buildResultFileFromStitched(
  stitched: { dataUrl: string; filename: string; width: number; height: number; format?: 'png' | 'jpeg' },
  interfaceName: string,
  category = 'Combined View',
  route = 'all'
): GeneratedResultFile {
  const approxBytes = Math.round((stitched.dataUrl.length * 3) / 4);
  const ext = stitched.filename.endsWith('.jpg') ? 'JPG' : 'PNG';
  return {
    id: `stitched-${stitched.filename}`,
    interfaceName,
    category,
    route,
    status: 'success',
    fileName: stitched.filename,
    fileFormat: ext,
    fileType: ext === 'JPG' ? 'image/jpeg' : 'image/png',
    fileSize: formatByteSize(approxBytes),
    dimensions: `${stitched.width} × ${stitched.height} px`,
    dataUrl: stitched.dataUrl,
    capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

export function buildFailureResultFile(
  name: string,
  route: string,
  error: string,
  category = 'Interface'
): GeneratedResultFile {
  return {
    id: `fail-${route}-${Date.now()}`,
    interfaceName: name,
    category,
    route,
    status: 'failed',
    errorMessage: error,
    fileName: `${name.replace(/\s+/g, '_')}_FAILED.txt`,
    fileFormat: 'PNG',
    fileType: 'text/plain',
    fileSize: '0 B',
    dimensions: 'Unavailable',
    capturedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

