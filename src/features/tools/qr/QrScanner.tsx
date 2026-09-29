import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ToolContainer } from '../../../components/layout/ToolContainer';
import { ShareDownloadBar } from '../../../components/common/ShareDownloadBar';
import { FileDropZone } from '../../../components/file/FileDropZone';
import { useApp } from '../../../context/AppContext';
import jsQR from 'jsqr';
import { Camera, CameraOff, ExternalLink, ShieldCheck, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { isValidHttpUrl, validateImageFile } from '../../../lib/security';

export const QrScanner: React.FC = () => {
  const { showToast } = useApp();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [decodedResult, setDecodedResult] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'file'>('camera');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  // Clean up on component unmount and when page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopCamera();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopCamera();
    };
  }, [stopCamera]);

  const scanFrame = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      animFrameRef.current = requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data) {
        setDecodedResult(code.data);
        showToast('QR Code detected!', 'success');
        stopCamera();
        return;
      }
    }

    animFrameRef.current = requestAnimationFrame(scanFrame);
  };

  const startCamera = async () => {
    setCameraError(null);
    setDecodedResult(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser.');
      return;
    }

    try {
      // Request environment (back) camera on mobile phones
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // required for iOS safari
        await videoRef.current.play();
        setIsScanning(true);
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch (err: unknown) {
      const errorMsg = (err as Error)?.name === 'NotAllowedError'
        ? 'Camera permission was denied. Please allow camera access in your browser settings or scan an image file.'
        : 'Could not connect to camera device.';
      setCameraError(errorMsg);
      setIsScanning(false);
    }
  };

  // Decode QR from uploaded image file
  const handleImageFile = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const check = validateImageFile(file, 50);
    if (!check.valid) {
      showToast(check.error || 'Please select a valid image file', 'error');
      return;
    }

    setIsProcessingFile(true);
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const maxDim = 1600;
        let cWidth = img.naturalWidth;
        let cHeight = img.naturalHeight;
        if (cWidth > maxDim || cHeight > maxDim) {
          if (cWidth > cHeight) {
            cHeight = Math.round((cHeight * maxDim) / cWidth);
            cWidth = maxDim;
          } else {
            cWidth = Math.round((cWidth * maxDim) / cHeight);
            cHeight = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, cWidth);
        canvas.height = Math.max(1, cHeight);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height, {
            inversionAttempts: 'attemptBoth',
          });

          if (code && code.data) {
            setDecodedResult(code.data);
            showToast('QR Code decoded from image!', 'success');
          } else {
            showToast('No readable QR code found in this image', 'error');
          }
        }
      } catch {
        showToast('Error processing image data', 'error');
      } finally {
        URL.revokeObjectURL(url);
        setIsProcessingFile(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      setIsProcessingFile(false);
      showToast('Could not load image file', 'error');
    };

    img.src = url;
  };

  const handleReset = () => {
    stopCamera();
    setDecodedResult(null);
    setCameraError(null);
  };

  const isUrl = decodedResult ? isValidHttpUrl(decodedResult) : false;

  return (
    <ToolContainer toolId="qr-scanner" onReset={handleReset} canReset={!!decodedResult || isScanning}>
      <div className="space-y-6">
        {/* Mode Selector (Live Camera vs Image File) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-sm">
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('camera');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'camera'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('file');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Scan Picture</span>
          </button>
        </div>

        {/* Tab 1: Live Camera Scanner */}
        {activeTab === 'camera' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Camera Viewfinder
              </span>
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Camera runs 100% on device</span>
              </span>
            </div>

            {/* Video Viewport Container */}
            <div className="relative aspect-square max-h-80 w-full mx-auto rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-800">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isScanning ? 'block' : 'hidden'}`}
              />

              {isScanning ? (
                /* Target crosshair overlay */
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-52 h-52 border-2 border-purple-400 rounded-2xl relative shadow-2xl">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-purple-500 -mt-1 -ml-1 rounded-tl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-purple-500 -mt-1 -mr-1 rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-purple-500 -mb-1 -ml-1 rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-purple-500 -mb-1 -mr-1 rounded-br" />
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-purple-500/80 animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-purple-400 mx-auto">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Camera is currently inactive</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Tap below to grant temporary browser permission and point your camera at any QR code.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Control Buttons */}
            <div className="flex justify-center pt-2">
              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/10 active:scale-[0.98] transition-all"
                >
                  <Camera className="h-4 w-4" />
                  <span>Start Camera Scanner</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-2 h-12 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-[0.98] transition-all"
                >
                  <CameraOff className="h-4 w-4" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {cameraError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Image File Scanner */}
        {activeTab === 'file' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-300 block">
              Scan from Photo or Screenshot
            </span>
            {isProcessingFile ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium">Scanning picture for QR code...</span>
              </div>
            ) : (
              <FileDropZone
                accept="image/*"
                onFilesSelected={handleImageFile}
                label="Select a picture containing a QR code"
                sublabel="Upload screenshots, photos, or saved images to extract QR data."
              />
            )}
          </div>
        )}

        {/* Decoded Result Card */}
        {decodedResult && (
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-purple-600 dark:text-purple-400">
                Decoded Result
              </span>
              <span className="text-slate-400">
                {isUrl ? 'Web Link' : 'Plain Text / Data'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 font-mono text-sm break-all text-slate-900 dark:text-white leading-relaxed">
              {decodedResult}
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              {isUrl && (
                <a
                  href={decodedResult}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-xs"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Link</span>
                </a>
              )}

              <ShareDownloadBar
                onCopyText={decodedResult}
                copyLabel="Copy Result"
                textToShare={decodedResult}
              />
            </div>
          </div>
        )}
      </div>
    </ToolContainer>
  );
};
