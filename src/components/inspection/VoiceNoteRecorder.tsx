
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, StopCircle, Play, Trash2, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceNoteRecorderProps {
  onSave: (audioData: string) => void;
  existingAudioUrl?: string;
  onDelete?: () => void;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSave,
  existingAudioUrl,
  onDelete,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize audio player if there's an existing audio URL
    if (existingAudioUrl) {
      setAudioUrl(existingAudioUrl);
    }
    
    // Create audio element for playback
    audioPlayerRef.current = new Audio();
    audioPlayerRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    
    return () => {
      // Clean up
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener('ended', () => {
          setIsPlaying(false);
        });
        audioPlayerRef.current = null;
      }
      
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [existingAudioUrl]);
  
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioUrl && !existingAudioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const newAudioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(newAudioUrl);
        
        // Update audio player source
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = newAudioUrl;
        }
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setPermissionDenied(false);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionDenied(true);
      toast({
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access to record voice notes',
        variant: 'destructive',
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Playback Error',
          description: 'Could not play audio',
          variant: 'destructive',
        });
      });
      setIsPlaying(true);
    }
  };
  
  const handleSave = () => {
    if (!audioBlob) return;
    
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Audio = base64data.split(',')[1];
      onSave(base64data);
      
      toast({
        title: 'Voice Note Saved',
        description: 'Your voice note has been saved',
      });
    };
  };
  
  const handleDelete = () => {
    if (audioUrl && !existingAudioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    
    if (onDelete) {
      onDelete();
    }
    
    toast({
      title: 'Voice Note Deleted',
      description: 'Your voice note has been deleted',
    });
  };
  
  return (
    <div className="space-y-3">
      {permissionDenied ? (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-2">
          Microphone access is required for voice notes. Please check your browser settings.
        </div>
      ) : null}
      
      <div className="flex flex-wrap gap-2">
        {!isRecording && !audioUrl && (
          <Button 
            type="button" 
            onClick={startRecording}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Mic className="h-4 w-4 mr-2" />
            Record Voice Note
          </Button>
        )}
        
        {isRecording && (
          <Button 
            type="button" 
            onClick={stopRecording}
            variant="destructive"
            size="sm"
            className="flex-1 animate-pulse"
          >
            <StopCircle className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        )}
        
        {audioUrl && !isRecording && (
          <>
            <Button 
              type="button" 
              onClick={togglePlayback}
              variant="outline"
              size="sm"
            >
              {isPlaying ? (
                <StopCircle className="h-4 w-4 mr-1" />
              ) : (
                <Play className="h-4 w-4 mr-1" />
              )}
              {isPlaying ? 'Stop' : 'Play'}
            </Button>
            
            {!existingAudioUrl && (
              <Button 
                type="button" 
                onClick={handleSave}
                variant="default"
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            )}
            
            <Button 
              type="button" 
              onClick={handleDelete}
              variant="outline"
              size="sm"
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;
