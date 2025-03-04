
import React, { useRef, useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  existingSignature: string | null;
  onSignatureEnd?: (signatureData: string) => void; // Add this prop
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ 
  onSave,
  existingSignature,
  onSignatureEnd
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = 150;

      // Set drawing style
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = getComputedStyle(document.documentElement)
        .getPropertyValue('--foreground')
        .trim();

      // Clear canvas
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load initial signature if provided
    if (existingSignature) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        setHasSignature(true);
      };
      img.src = existingSignature;
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [existingSignature]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    // Get starting position
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get current position
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);

    // Send signature data to parent
    const signatureData = canvas.toDataURL('image/png');
    onSave(signatureData);
    
    // Call the onSignatureEnd if provided
    if (onSignatureEnd) {
      onSignatureEnd(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSave('');
    
    // Call onSignatureEnd with empty string if provided
    if (onSignatureEnd) {
      onSignatureEnd('');
    }
  };

  return (
    <div>
      <div className="relative border rounded-md overflow-hidden bg-transparent">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground">
            Sign here
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Info size={12} className="mr-1" />
          <span>Sign using mouse or touch</span>
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={clearCanvas}
          disabled={!hasSignature}
          className="h-7 text-xs"
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default SignatureCanvas;
