// Inside CameraCapture.tsx

const startCamera = async () => {
  setIsLoading(true);
  setError(null);

  try {
    if (streamRef.current) {
      stopCamera();
    }

    // Always request back-facing camera for PPE photos
    const constraints = {
      video: { facingMode: 'environment' }
    };

    // Try to get media stream
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => {
              setIsCameraActive(true);
              setIsLoading(false);
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setError('Could not start video playback');
              setIsLoading(false);
              stopCamera();
            });
        }
      };
    }
  } catch (error: any) {
    console.error('Error accessing camera:', error);

    let errorMessage = 'Could not access camera.';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Camera access denied. Please grant camera permissions.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      errorMessage = 'No camera found on this device.';
    } else if (error.name === ' ▋
