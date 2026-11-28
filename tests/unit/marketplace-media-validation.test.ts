import { describe, expect, it } from 'vitest';
import {
  getJpegDimensions,
  isJxl,
  validateDimensions,
} from '../../netlify/functions/admin-marketplace-media.mjs';

function makeJpeg({ width = 32, height = 16, endMarker = true } = {}) {
  const frame = Buffer.from([
    0xff, 0xd8,             // SOI
    0xff, 0xc0, 0x00, 0x0b, // SOF0 marker + segment length
    0x08,                  // precision
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00, // one component
  ]);
  return endMarker ? Buffer.concat([frame, Buffer.from([0xff, 0xd9])]) : frame;
}

describe('marketplace media validators', () => {
  describe('JPEG frame parsing', () => {
    it('extracts frame dimensions from JPEG SOF marker', () => {
      expect(getJpegDimensions(makeJpeg({ width: 640, height: 480 }))).toEqual({
        width: 640,
        height: 480,
      });
    });

    it('rejects files without a JPEG signature', () => {
      expect(getJpegDimensions(Buffer.from('not-a-jpeg'))).toBeNull();
    });

    it('rejects JPEGs missing the EOI marker', () => {
      expect(getJpegDimensions(makeJpeg({ endMarker: false }))).toBeNull();
    });

    it('rejects malformed or truncated SOF segments', () => {
      const malformed = Buffer.from([
        0xff, 0xd8, 0xff, 0xc0, 0x00, 0x01, 0x08, 0xff, 0xd9,
      ]);
      expect(getJpegDimensions(malformed)).toBeNull();
    });

    it('rejects zero frame dimensions', () => {
      expect(getJpegDimensions(makeJpeg({ width: 0, height: 16 }))).toBeNull();
      expect(getJpegDimensions(makeJpeg({ width: 32, height: 0 }))).toBeNull();
    });
  });

  describe('JPEG XL signature validation', () => {
    it('accepts the raw codestream signature', () => {
      expect(isJxl(Buffer.from([0xff, 0x0a, 0x01]))).toBe(true);
    });

    it('accepts the JXL container signature', () => {
      expect(isJxl(Buffer.from([
        0x00, 0x00, 0x00, 0x0c, 0x4a, 0x58, 0x4c, 0x20,
        0x00, 0x00, 0x00, 0x00,
      ]))).toBe(true);
    });

    it('rejects unrelated and truncated data', () => {
      expect(isJxl(Buffer.from('image/jxl'))).toBe(false);
      expect(isJxl(Buffer.from([0xff]))).toBe(false);
    });
  });

  describe('dimension validation', () => {
    const frame = { width: 640, height: 480 };

    it('accepts exact valid frame dimensions', () => {
      expect(validateDimensions(640, 480, frame)).toBe(true);
    });

    it('rejects client dimensions that differ from the JPEG frame', () => {
      expect(validateDimensions(641, 480, frame)).toBe(false);
      expect(validateDimensions(640, 479, frame)).toBe(false);
    });

    it('rejects non-integers, zero, negative and oversized dimensions', () => {
      for (const [width, height] of [
        [0, 480], [-1, 480], [640, 0], [640, -1],
        [6001, 480], [640, 6001], [640.5, 480], [640, NaN],
      ]) {
        expect(validateDimensions(width, height, frame)).toBe(false);
      }
    });

    it('rejects missing parsed frame dimensions', () => {
      expect(validateDimensions(640, 480, null)).toBe(false);
    });
  });
});
