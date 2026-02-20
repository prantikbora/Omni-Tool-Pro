import { Html5QrcodeScannerState, Html5QrcodeScanType } from "html5-qrcode";

// We use a plain object here to avoid the unexported type error. 
// The library will validate this at runtime.
export const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  rememberLastUsedCamera: true,
  supportedScanTypes: [
    Html5QrcodeScanType.SCAN_TYPE_CAMERA, 
    Html5QrcodeScanType.SCAN_TYPE_FILE
  ], 
};

export const isURL = (str: string): boolean => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};