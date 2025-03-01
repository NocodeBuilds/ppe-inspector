
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { PPEItem, InspectionCheckpoint } from '@/types';
import { ArrowLeft, Camera, Check, X, Minus, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import CheckpointItem from '@/components/inspection/CheckpointItem';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import CardOverlay from '@/components/ui/card-overlay';

const InspectionForm = () => {
  const { ppeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [ppeItem, setPpeItem] = useState<PPEItem | null>(null);
  const [inspectionType, setInspectionType] = useState<'pre-use' | 'monthly' | 'quarterly'>('pre-use');
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [comments, setComments] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [checkpointResults, setCheckpointResults] = useState<{
    [id: string]: {
      status: 'ok' | 'not-ok' | 'na';
      notes: string;
      photoUrl?: string;
    };
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (ppeId) {
      fetchPPEItem();
    }
  }, [ppeId]);

  useEffect(() => {
    if (ppeItem) {
      fetchCheckpoints();
    }
  }, [ppeItem]);

  const fetchPPEItem = async () => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', ppeId)
        .single();

      if (error) throw error;

      if (data) {
        setPpeItem({
          id: data.id,
          serialNumber: data.serial_number,
          type: data.type,
          brand: data.brand,
          modelNumber: data.model_number,
          manufacturingDate: data.manufacturing_date,
          expiryDate: data.expiry_date,
          status: data.status,
          imageUrl: data.image_url || undefined,
          lastInspection: data.last_inspection || undefined,
          nextInspection: data.next_inspection || undefined,
        });
      }
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load PPE information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCheckpoints = async () => {
    if (!ppeItem) return;
    
    try {
      const { data, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeItem.type);

      if (error) throw error;

      if (data) {
        const checkpointsData = data.map(checkpoint => ({
          id: checkpoint.id,
          description: checkpoint.description,
          ppeType: checkpoint.ppe_type,
        }));
        
        setCheckpoints(checkpointsData);
        
        // Initialize checkpoint results
        const initialResults: { [id: string]: { status: 'ok' | 'not-ok' | 'na'; notes: string; photoUrl?: string } } = {};
        checkpointsData.forEach(checkpoint => {
          initialResults[checkpoint.id] = { status: 'na', notes: '' };
        });
        
        setCheckpointResults(initialResults);
      }
    } catch (error: any) {
      console.error('Error fetching checkpoints:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inspection checkpoints',
        variant: 'destructive',
      });
    }
  };

  const handleCheckpointChange = (checkpointId: string, field: 'status' | 'notes' | 'photoUrl', value: any) => {
    setCheckpointResults(prev => ({
      ...prev,
      [checkpointId]: {
        ...prev[checkpointId],
        [field]: value
      }
    }));
  };

  const handleCapturePicture = async (checkpointId: string) => {
    // In a real app, this would open the camera to capture a picture
    // For now, we'll just simulate uploading an image
    toast({
      title: 'Camera',
      description: 'Camera functionality is coming soon',
    });
  };

  const handleSignatureChange = (dataUrl: string) => {
    setSignature(dataUrl);
  };

  const isFormValid = () => {
    if (!ppeItem || !signature) return false;
    
    // Check if at least one checkpoint has been evaluated
    const hasEvaluatedCheckpoint = Object.values(checkpointResults).some(
      result => result.status !== 'na'
    );
    
    return hasEvaluatedCheckpoint;
  };

  const getOverallResult = () => {
    // If any checkpoint is 'not-ok', the overall result is 'fail'
    const hasFailedCheckpoint = Object.values(checkpointResults).some(
      result => result.status === 'not-ok'
    );
    
    return hasFailedCheckpoint ? 'fail' : 'pass';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast({
        title: 'Incomplete Form',
        description: 'Please complete the inspection form including your signature',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Upload signature image to storage
      let signatureUrl = null;
      if (signature) {
        const fileName = `signatures/${ppeId}_${Date.now()}.png`;
        const { data: signatureData, error: signatureError } = await supabase.storage
          .from('inspections')
          .upload(fileName, 
            // Convert the base64 signature to a Blob
            await (await fetch(signature)).blob(), 
            { contentType: 'image/png' }
          );
          
        if (signatureError) throw signatureError;
        signatureUrl = signatureData?.path || null;
      }
      
      // Create inspection record
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: user?.id,
          type: inspectionType,
          date: inspectionDate.toISOString(),
          overall_result: getOverallResult(),
          signature_url: signatureUrl,
          notes: comments
        })
        .select()
        .single();
        
      if (inspectionError) throw inspectionError;
      
      // Insert checkpoint results
      const checkpointResultsToInsert = Object.entries(checkpointResults).map(([checkpointId, result]) => ({
        inspection_id: inspectionData.id,
        checkpoint_id: checkpointId,
        passed: result.status === 'ok',
        notes: result.notes,
        photo_url: result.photoUrl
      }));
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(checkpointResultsToInsert);
        
      if (resultsError) throw resultsError;
      
      // Update PPE item with last inspection date and next inspection date
      const nextInspectionDate = new Date(inspectionDate);
      if (inspectionType === 'pre-use') {
        nextInspectionDate.setDate(nextInspectionDate.getDate() + 1); // Next day
      } else if (inspectionType === 'monthly') {
        nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1); // Next month
      } else if (inspectionType === 'quarterly') {
        nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 3); // Next quarter
      }
      
      const { error: updateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: inspectionDate.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          status: getOverallResult() === 'pass' ? 'active' : 'flagged'
        })
        .eq('id', ppeId);
        
      if (updateError) throw updateError;
      
      // Show success state
      setShowSuccess(true);
      
    } catch (error: any) {
      console.error('Error saving inspection:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save inspection',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ppeItem) {
    return (
      <div className="text-center my-12">
        <p className="text-muted-foreground">PPE item not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 fade-in">
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-2xl font-bold">Inspection Form</h1>
      </div>
      
      <div className="glass-card rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">{ppeItem.type}</h2>
        <p className="text-sm text-muted-foreground">Serial: {ppeItem.serialNumber}</p>
        <p className="text-sm">Brand: {ppeItem.brand}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Inspection Type</label>
            <Select
              value={inspectionType}
              onValueChange={(value: 'pre-use' | 'monthly' | 'quarterly') => setInspectionType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-use">Pre-use</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Inspection Date</label>
            <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !inspectionDate && "text-muted-foreground"
                  )}
                >
                  {inspectionDate ? format(inspectionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={inspectionDate}
                  onSelect={(date) => {
                    setInspectionDate(date || new Date());
                    setShowDatePicker(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold">Inspection Checkpoints</h3>
          
          {checkpoints.length > 0 ? (
            checkpoints.map((checkpoint, index) => (
              <CheckpointItem
                key={checkpoint.id}
                checkpoint={checkpoint}
                result={checkpointResults[checkpoint.id]}
                onStatusChange={(status) => handleCheckpointChange(checkpoint.id, 'status', status)}
                onNotesChange={(notes) => handleCheckpointChange(checkpoint.id, 'notes', notes)}
                onCapturePicture={() => handleCapturePicture(checkpoint.id)}
              />
            ))
          ) : (
            <p className="text-muted-foreground">No checkpoints found for this PPE type</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Comments</label>
          <Textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Additional comments"
            className="min-h-24"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Inspector Signature</label>
          <SignatureCanvas onChange={handleSignatureChange} />
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-success hover:bg-success/90"
          disabled={isSaving || !isFormValid()}
        >
          {isSaving ? 'Saving...' : 'Submit Inspection'}
        </Button>
      </form>
      
      <CardOverlay show={showSuccess} onClose={() => setShowSuccess(false)}>
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h3 className="text-xl font-bold mb-2">Inspection Submitted Successfully!</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Choose how you would like to share the inspection report or start a new inspection.
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button onClick={() => {}} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
              <span>PDF</span>
            </Button>
            
            <Button onClick={() => {}} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <path d="M14 2v6h6"></path>
                <path d="M8 13h2"></path>
                <path d="M8 17h2"></path>
                <path d="M14 13h2"></path>
                <path d="M14 17h2"></path>
              </svg>
              <span>Excel</span>
            </Button>
            
            <Button onClick={() => {}} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp</span>
            </Button>
            
            <Button onClick={() => {}} variant="outline" className="h-12 space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
              <span>Email</span>
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Home
            </Button>
            
            <Button className="flex-1 h-12 bg-success hover:bg-success/90" onClick={() => {
              setShowSuccess(false);
              navigate('/equipment');
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
              New Inspection
            </Button>
          </div>
        </div>
      </CardOverlay>
    </div>
  );
};

export default InspectionForm;
