declare module 'qr-scanner' {
  export interface QRScannerOptions {
    onDecode?: (result: string) => void;
    onDecodeError?: (error: Error) => void;
    highlightScanRegion?: boolean;
    highlightCodeOutline?: boolean;
  }

  export interface QRScanResultDetailed {
    data: string;
    cornerPoints?: unknown;
  }

  export default class QrScanner {
    constructor(
      video: HTMLVideoElement,
      onDecode: (result: string | QRScanResultDetailed) => void,
      options?: QRScannerOptions
    );
    start(): Promise<void>;
    stop(): void;
    static scanImage(
      imageOrFile: HTMLImageElement | HTMLCanvasElement | File | Blob,
      options?: { returnDetailedScanResult?: boolean }
    ): Promise<string | QRScanResultDetailed>;
  }
}
