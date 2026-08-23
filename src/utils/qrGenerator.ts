import QRCode from 'qrcode';

/**
 * Generates a high-resolution Data URL for the QR code
 */
export async function generateQrDataUrl(
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    width?: number;
  }
): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: options?.width || 180,
      color: {
        dark: options?.colorDark || '#07090e',
        light: options?.colorLight || '#ffffff',
      },
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code Data URL:', err);
    return '';
  }
}

/**
 * Renders QR code onto a provided HTML Canvas element with explicit pixel constraints
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    width?: number;
  }
): Promise<void> {
  try {
    await QRCode.toCanvas(canvas, text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: options?.width || 110,
      color: {
        dark: options?.colorDark || '#07090e',
        light: options?.colorLight || '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to render QR Code on canvas:', err);
  }
}
