
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Split, Maximize2, Minimize2 } from 'lucide-react';

interface PhotoComparisonProps {
  currentPhoto: string;
  referencePhoto: string;
  onClose: () => void;
}

const PhotoComparison: React.FC<PhotoComparisonProps> = ({
  currentPhoto,
  referencePhoto,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'swipe'>('side-by-side');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(0.5);
  const [swipePosition, setSwipePosition] = useState(50);
  
  const comparisonRef = React.useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (comparisonRef.current?.requestFullscreen) {
        comparisonRef.current.requestFullscreen().catch(err => {
          console.error('Error attempting to enable fullscreen:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error('Error attempting to exit fullscreen:', err);
        });
      }
    }
    setFullscreen(!fullscreen);
  };
  
  const handleSwipe = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSwipePosition(Number(e.target.value));
  };
  
  const handleOverlayOpacity = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverlayOpacity(Number(e.target.value));
  };
  
  const renderSideBySide = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="overflow-hidden">
        <p className="text-xs text-center mb-1 font-medium">Reference Photo</p>
        <div className="bg-black rounded-md overflow-hidden flex items-center justify-center">
          <img 
            src={referencePhoto} 
            alt="Reference" 
            className="object-contain max-h-64"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
      </div>
      <div className="overflow-hidden">
        <p className="text-xs text-center mb-1 font-medium">Current Photo</p>
        <div className="bg-black rounded-md overflow-hidden flex items-center justify-center">
          <img 
            src={currentPhoto} 
            alt="Current" 
            className="object-contain max-h-64"
            style={{ transform: `scale(${zoomLevel})` }}
          />
        </div>
      </div>
    </div>
  );
  
  const renderOverlay = () => (
    <div className="relative">
      <div className="bg-black rounded-md overflow-hidden flex items-center justify-center">
        <img 
          src={referencePhoto} 
          alt="Reference" 
          className="object-contain max-h-64 w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center bg-black rounded-md overflow-hidden"
        style={{ opacity: overlayOpacity }}
      >
        <img 
          src={currentPhoto} 
          alt="Current" 
          className="object-contain max-h-64 w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>
      <div className="mt-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={overlayOpacity}
          onChange={handleOverlayOpacity}
          className="w-full"
        />
        <div className="flex justify-between text-xs">
          <span>Reference</span>
          <span>Current</span>
        </div>
      </div>
    </div>
  );
  
  const renderSwipe = () => (
    <div className="relative">
      <div className="bg-black rounded-md overflow-hidden flex items-center justify-center h-64">
        <img 
          src={referencePhoto} 
          alt="Reference" 
          className="object-contain h-full w-full"
          style={{ transform: `scale(${zoomLevel})` }}
        />
      </div>
      <div 
        className="absolute top-0 left-0 h-full overflow-hidden bg-black rounded-md"
        style={{ width: `${swipePosition}%` }}
      >
        <img 
          src={currentPhoto} 
          alt="Current" 
          className="object-contain h-full w-full"
          style={{ 
            transform: `scale(${zoomLevel})`,
            width: `${100 / (swipePosition/100)}%`
          }}
        />
      </div>
      <div className="mt-2">
        <input
          type="range"
          min="0"
          max="100"
          value={swipePosition}
          onChange={handleSwipe}
          className="w-full"
        />
        <div className="flex justify-between text-xs">
          <span>Current</span>
          <span>Reference</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="p-4" ref={comparisonRef}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Photo Comparison</h3>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFullscreen}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="bg-muted/20 rounded-lg p-3 mb-4">
        <div className="flex gap-2 justify-center mb-4">
          <Button
            variant={viewMode === 'side-by-side' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('side-by-side')}
          >
            <Split className="h-4 w-4 mr-1" />
            Side by Side
          </Button>
          <Button
            variant={viewMode === 'overlay' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('overlay')}
          >
            <Maximize2 className="h-4 w-4 mr-1" />
            Overlay
          </Button>
          <Button
            variant={viewMode === 'swipe' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('swipe')}
          >
            <ChevronRight className="h-4 w-4 mr-1" />
            Swipe
          </Button>
        </div>
        
        {viewMode === 'side-by-side' && renderSideBySide()}
        {viewMode === 'overlay' && renderOverlay()}
        {viewMode === 'swipe' && renderSwipe()}
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default PhotoComparison;
