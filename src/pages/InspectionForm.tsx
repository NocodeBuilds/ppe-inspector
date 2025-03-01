
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, File, Send, CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PPEType, InspectionType, InspectionCheckpoint, CheckpointStatus } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import { cn } from '@/lib/utils';

const InspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const signatureRef = useRef<any>(null);
  
  const [ppeItem, setPpeItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inspectionType, setInspectionType] = useState<InspectionType>('pre-use');
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [statusList, setStatusList] = useState<CheckpointStatus[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [activeCheckpointId, setActiveCheckpointId] = useState<string | null>(null);
  
  useEffect(() => {
    if (ppeId) {
      fetchPPEItem();
    }
  }, [ppeId]);
  
  const fetchPPEItem = async () => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', ppeId)
        .single();
      
      if (error) throw error;
      
      // Convert from supabase format to our app format
      const ppeTypeValue = data.type as PPEType;
      
      setPpeItem({
        id: data.id,
        serialNumber: data.serial_number,
        type: ppeTypeValue,
        brand: data.brand,
        modelNumber: data.model_number,
        manufacturingDate: data.manufacturing_date,
        expiryDate: data.expiry_date,
        status: data.status,
        imageUrl: data.image_url,
        lastInspection: data.last_inspection,
        nextInspection: data.next_inspection
      });
      
      fetchCheckpoints(ppeTypeValue);
    } catch (error) {
      console.error('Error fetching PPE item:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PPE item details',
        variant: 'destructive',
      });
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCheckpoints = async (ppeType: PPEType) => {
    try {
      const { data, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeType);
      
      if (error) throw error;
      
      // Convert to our app format
      const formattedCheckpoints = data.map(item => ({
        id: item.id,
        description: item.description,
        ppeType: item.ppe_type as PPEType
      }));
      
      setCheckpoints(formattedCheckpoints);
      
      // Initialize status list
      const initialStatus = formattedCheckpoints.map(checkpoint => ({
        checkpointId: checkpoint.id,
        status: 'na' as 'ok' | 'not-ok' | 'na', 
        notes: ''
      }));
      
      setStatusList(initialStatus);
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inspection checkpoints',
        variant: 'destructive',
      });
    }
  };
  
  const handleStatusChange = (checkpointId: string, status: 'ok' | 'not-ok' | 'na') => {
    setStatusList(prev => 
      prev.map(item => 
        item.checkpointId === checkpointId 
          ? { ...item, status } 
          : item
      )
    );
  };
  
  const handleNotesChange = (checkpointId: string, notes: string) => {
    setStatusList(prev => 
      prev.map(item => 
        item.checkpointId === checkpointId 
          ? { ...item, notes } 
          : item
      )
    );
  };
  
  const capturePhoto = (checkpointId: string) => {
    setActiveCheckpointId(checkpointId);
    setCameraActive(true);
    // In a real implementation, we would activate the device camera here
    // and save the photo to the checkpoint
  };
  
  const handleSubmit = async () => {
    if (!profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit an inspection',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate that all checkpoints have been addressed
    const incompleteCheckpoints = statusList.filter(item => item.status === 'na');
    if (incompleteCheckpoints.length > 0) {
      toast({
        title: 'Incomplete Inspection',
        description: 'Please complete all checkpoints before submitting',
        variant: 'destructive',
      });
      return;
    }
    
    if (!signature) {
      toast({
        title: 'Signature Required',
        description: 'Please sign the inspection form',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Calculate overall result - fail if any checkpoint is not-ok
      const overallResult = statusList.some(item => item.status === 'not-ok') ? 'fail' : 'pass';
      
      // Upload signature
      let signatureUrl = null;
      if (signature) {
        const fileName = `signatures/${ppeId}-${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from('inspections')
          .upload(fileName, base64ToBlob(signature), {
            contentType: 'image/png'
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('inspections')
          .getPublicUrl(fileName);
          
        signatureUrl = publicUrl;
      }
      
      // Create inspection record
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: profile.id,
          type: inspectionType,
          date: new Date().toISOString(),
          overall_result: overallResult,
          signature_url: signatureUrl,
          notes: generalNotes
        })
        .select()
        .single();
        
      if (inspectionError) throw inspectionError;
      
      // Create inspection results
      const resultPromises = statusList.map(item => 
        supabase
          .from('inspection_results')
          .insert({
            inspection_id: inspection.id,
            checkpoint_id: item.checkpointId,
            passed: item.status === 'ok',
            notes: item.notes,
            photo_url: item.photoUrl
          })
      );
      
      await Promise.all(resultPromises);
      
      // Update PPE item with last inspection and status if failed
      const updates: any = {
        last_inspection: new Date().toISOString(),
        next_inspection: calculateNextInspection(inspectionType)
      };
      
      // Update status if inspection failed
      if (overallResult === 'fail') {
        updates.status = 'flagged';
      }
      
      await supabase
        .from('ppe_items')
        .update(updates)
        .eq('id', ppeId);
      
      toast({
        title: 'Inspection Submitted',
        description: 'The inspection has been successfully recorded',
      });
      
      navigate('/equipment');
    } catch (error) {
      console.error('Error submitting inspection:', error);
      toast({
        title: 'Submission Failed',
        description: 'Failed to submit the inspection',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const calculateNextInspection = (type: InspectionType): string => {
    const now = new Date();
    let nextDate = new Date(now);
    
    switch (type) {
      case 'pre-use':
        // Next day
        nextDate.setDate(now.getDate() + 1);
        break;
      case 'monthly':
        // Next month
        nextDate.setMonth(now.getMonth() + 1);
        break;
      case 'quarterly':
        // Next quarter (3 months)
        nextDate.setMonth(now.getMonth() + 3);
        break;
    }
    
    return nextDate.toISOString();
  };
  
  // Convert base64 to Blob for upload
  const base64ToBlob = (dataURI: string) => {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fade-in pb-20">
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/equipment')}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Inspection Form</h1>
      </div>
      
      <div className="glass-card rounded-lg p-4 mb-6">
        <h2 className="font-semibold mb-2">{ppeItem?.type}</h2>
        <div className="text-sm space-y-1">
          <p><span className="text-muted-foreground">Serial Number:</span> {ppeItem?.serialNumber}</p>
          <p><span className="text-muted-foreground">Brand:</span> {ppeItem?.brand}</p>
          <p><span className="text-muted-foreground">Model:</span> {ppeItem?.modelNumber}</p>
        </div>
      </div>
      
      <div className="mb-6 space-y-3">
        <label className="text-sm font-medium">Inspection Type</label>
        <Select
          value={inspectionType}
          onValueChange={(value) => setInspectionType(value as InspectionType)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pre-use">Pre-use</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-6 mb-8">
        <h2 className="font-semibold">Inspection Checkpoints</h2>
        
        {checkpoints.map((checkpoint) => (
          <div key={checkpoint.id} className="glass-card rounded-lg p-4">
            <h3 className="font-medium mb-3">{checkpoint.description}</h3>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "flex-1",
                  statusList.find(i => i.checkpointId === checkpoint.id)?.status === 'ok' && 
                  "bg-green-500 text-white hover:bg-green-600 hover:text-white"
                )}
                onClick={() => handleStatusChange(checkpoint.id, 'ok')}
              >
                <CheckCircle size={18} className="mr-1" />
                OK
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "flex-1",
                  statusList.find(i => i.checkpointId === checkpoint.id)?.status === 'not-ok' && 
                  "bg-red-500 text-white hover:bg-red-600 hover:text-white"
                )}
                onClick={() => handleStatusChange(checkpoint.id, 'not-ok')}
              >
                <XCircle size={18} className="mr-1" />
                NOT OK
              </Button>
              
              <Button 
                size="sm" 
                variant="outline" 
                className={cn(
                  "flex-1",
                  statusList.find(i => i.checkpointId === checkpoint.id)?.status === 'na' && 
                  "bg-gray-500 text-white hover:bg-gray-600 hover:text-white"
                )}
                onClick={() => handleStatusChange(checkpoint.id, 'na')}
              >
                <HelpCircle size={18} className="mr-1" />
                N/A
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Textarea 
                placeholder="Add remarks..." 
                className="text-sm"
                value={statusList.find(i => i.checkpointId === checkpoint.id)?.notes || ''}
                onChange={(e) => handleNotesChange(checkpoint.id, e.target.value)}
              />
              
              <Button 
                size="icon" 
                variant="outline" 
                onClick={() => capturePhoto(checkpoint.id)}
                className="flex-shrink-0"
              >
                <Camera size={18} />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold">General Notes</h2>
        <Textarea 
          placeholder="Add any general notes about this inspection..." 
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-4 mb-8">
        <h2 className="font-semibold">Inspector Signature</h2>
        <div className="glass-card rounded-lg p-4 bg-white">
          <SignatureCanvas 
            ref={signatureRef}
            onEnd={(signatureData) => setSignature(signatureData)}
          />
        </div>
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              if (signatureRef.current) {
                signatureRef.current.clear();
                setSignature(null);
              }
            }}
          >
            Clear
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/equipment')}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary hover:bg-primary/90"
        >
          {submitting ? 'Submitting...' : 'Submit Inspection'}
          <Send size={16} className="ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default InspectionForm;
