
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SignatureCanvasProps {
  onChange: (dataURL: string) => void;
}

const SignatureCanvas = ({ onChange }: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.strokeStyle = '#000';
      setCtx(context);
    }
    
    return () => {
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);
  
  useEffect(() => {
    // Adjust canvas size on load and window resize
    const handleResize = () => {
      if (!canvasRef.current || !ctx) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas size with device pixel ratio for high-resolution displays
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
      
      // Scale context according to the pixel ratio
      ctx.scale(pixelRatio, pixelRatio);
      
      // Set CSS size
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      // Clear canvas and restore settings
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#000';
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [ctx]);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    
    setIsDrawing(true);
    setHasSigned(true);
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Touch event
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    if (!isDrawing || !ctx || !canvasRef.current) return;
    
    ctx.closePath();
    setIsDrawing(false);
    
    // Get the signature as a data URL and pass it to the parent component
    const dataURL = canvasRef.current.toDataURL('image/png');
    onChange(dataURL);
  };
  
  const clearSignature = () => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width / window.devicePixelRatio, canvas.height / window.devicePixelRatio);
    setHasSigned(false);
    onChange(''); // Clear the signature data
  };
  
  return (
    <div className="space-y-2">
      <div 
        className={cn(
          "border-2 border-dashed rounded-lg bg-background overflow-hidden relative",
          hasSigned ? "border-primary" : "border-muted-foreground/30"
        )}
        style={{ height: '150px' }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {!hasSigned && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-sm">Sign here</p>
          </div>
        )}
      </div>
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={clearSignature}
        disabled={!hasSigned}
        className="w-full"
      >
        Clear Signature
      </Button>
    </div>
  );
};

export default SignatureCanvas;
