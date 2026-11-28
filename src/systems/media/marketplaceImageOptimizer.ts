const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const MAX_VARIANT_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1800;
const ACCEPTED_INPUT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export type OptimizedMarketplaceImage = {
  jpeg: File;
  jxl: File;
  width: number;
  height: number;
};

function canvasToJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob || blob.type !== 'image/jpeg') {
        reject(new Error('JPEG optimization is unavailable in this browser.'));
        return;
      }
      resolve(blob);
    }, 'image/jpeg', 0.86);
  });
}

/**
 * Produces a metadata-free JPEG fallback and a JPEG XL variant from the same
 * normalized pixels. The JXL WASM codec is loaded only when an admin uploads
 * marketplace media, keeping the public homepage bundle small.
 */
export async function optimizeMarketplaceImage(file: File): Promise<OptimizedMarketplaceImage> {
  if (!ACCEPTED_INPUT_TYPES.has(file.type)) {
    throw new Error('Choose a JPEG, PNG, WebP or AVIF image.');
  }
  if (file.size < 1 || file.size > MAX_SOURCE_BYTES) {
    throw new Error('The source image must be 15 MB or smaller.');
  }

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Image processing could not be initialized.');

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);

    const jpegBlob = await canvasToJpeg(canvas);
    const imageData = context.getImageData(0, 0, width, height);
    const { encode } = await import('@jsquash/jxl');
    const jxlBuffer = await encode(imageData, { quality: 86, effort: 7 });

    if (jpegBlob.size > MAX_VARIANT_BYTES || jxlBuffer.byteLength > MAX_VARIANT_BYTES) {
      throw new Error('The optimized image exceeds the 5 MB per-format limit. Choose a smaller image.');
    }

    const baseName = (file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 70) || 'marketplace-image');
    return {
      jpeg: new File([jpegBlob], baseName + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }),
      jxl: new File([jxlBuffer], baseName + '.jxl', { type: 'image/jxl', lastModified: Date.now() }),
      width,
      height,
    };
  } catch (error) {
    if (error instanceof Error && /JPEG XL|image|processing|optimized/i.test(error.message)) throw error;
    throw new Error('The image could not be optimized into JPEG and JPEG XL formats.');
  } finally {
    bitmap?.close();
  }
}
