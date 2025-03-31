import { useState, useCallback } from 'react';

export interface ScanState {
  isProcessing: boolean;
  lastScanId: string | null;
  scanTime: number | null;
}

export const useQRScannerManager = () => {
  const [scanState, setScanState] = useState<ScanState>({
    isProcessing: false,
    lastScanId: null,
    scanTime: null
  });

  const processScan = useCallback(async (result: string) => {
    // Debounce and dedup scans
    const now = Date.now();
    if (
      scanState.isProcessing || 
      (scanState.lastScanId === result && 
       scanState.scanTime && 
       now - scanState.scanTime < 2000)
    ) {
      return false;
    }

    setScanState({
      isProcessing: true,
      lastScanId: result,
      scanTime: now
    });

    return true;
  }, [scanState]);

  const resetScan = useCallback(() => {
    setScanState({
      isProcessing: false,
      lastScanId: null,
      scanTime: null
    });
  }, []);

  return {
    scanState,
    processScan,
    resetScan
  };
};
