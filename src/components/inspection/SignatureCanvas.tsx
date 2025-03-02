
import React, { useRef, useState, useEffect } from 'react';

export interface SignatureCanvasProps {
  onSignatureEnd: (signatureData: string) => void; // Add this prop to match usage in InspectionForm
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureEnd }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext('2d');
    if (context) {
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = '#000';
      setCtx(context);
    }
    
    // Resize canvas to fit parent
    const resizeCanvas = () => {
      if (canvas) {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = 150; // Fixed height
        }
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Get coordinates
    const coordinates = getCoordinates(e);
    if (coordinates) {
      ctx.moveTo(coordinates.x, coordinates.y);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // Get coordinates
    const coordinates = getCoordinates(e);
    if (coordinates) {
      ctx.lineTo(coordinates.x, coordinates.y);
      ctx.stroke();
    }
  };
  
  const endDrawing = () => {
    if (isDrawing && ctx) {
      ctx.closePath();
      setIsDrawing(false);
      
      // Save signature data
      const canvas = canvasRef.current;
      if (canvas) {
        const signatureData = canvas.toDataURL();
        onSignatureEnd(signatureData);
      }
    }
  };
  
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    if ('touches' in e) {
      // Touch event
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      // Mouse event
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      className="border border-muted-foreground/30 bg-white w-full cursor-crosshair"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={endDrawing}
    />
  );
};

export default SignatureCanvas;
