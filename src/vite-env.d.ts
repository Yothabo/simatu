/// <reference types="vite/client" />

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.jpeg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '@jsquash/jxl' {
  export function encode(
    imageData: ImageData,
    options?: { quality?: number; effort?: number },
  ): Promise<ArrayBuffer>;
}
