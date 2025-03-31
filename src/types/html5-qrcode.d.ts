declare module 'html5-qrcode' {
  export enum Html5QrcodeSupportedFormats {
    QR_CODE = 0,
    AZTEC,
    CODABAR,
    CODE_39,
    CODE_93,
    CODE_128,
    DATA_MATRIX,
    MAXICODE,
    ITF,
    EAN_13,
    EAN_8,
    PDF_417,
    RSS_14,
    RSS_EXPANDED,
    UPC_A,
    UPC_E,
    UPC_EAN_EXTENSION
  }

  export interface Html5QrcodeConfigs {
    fps?: number;
    qrbox?: { width: number; height: number } | number;
    aspectRatio?: number;
    disableFlip?: boolean;
    formatsToSupport?: Html5QrcodeSupportedFormats[];
    experimentalFeatures?: {
      useBarCodeDetectorIfSupported?: boolean;
    };
    verbose?: boolean;
  }

  export type QrcodeSuccessCallback = (decodedText: string, decodedResult?: any) => void;
  export type QrcodeErrorCallback = (errorMessage: string, error?: any) => void;

  export class Html5Qrcode {
    constructor(elementId: string, config?: Html5QrcodeConfigs);

    start(
      cameraId: string,
      configuration: Html5QrcodeConfigs,
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): Promise<void>;

    stop(): Promise<void>;
    clear(): void;
    getState(): void;
    applyVideoConstraints(videoConstraints: MediaTrackConstraints): Promise<void>;
    foreverScan(
      config: Html5QrcodeConfigs,
      qrCodeSuccessCallback: QrcodeSuccessCallback,
      qrCodeErrorCallback?: QrcodeErrorCallback
    ): Promise<void>;
    static getCameras(): Promise<{ id: string; label: string }[]>;
    pause(shouldPause?: boolean): void;
    resume(): void;
    getRunningTrackCapabilities(): MediaTrackCapabilities;
    getRunningTrackSettings(): MediaTrackSettings;
    getRunningTrackCameraCapabilities(): void;
    applyVideoConstraints(videoConstraints: MediaTrackConstraints): Promise<void>;
    hasFlash(): Promise<boolean>;
    toggleFlash(): Promise<void>;
    isFlashOn(): boolean;
  }
}
