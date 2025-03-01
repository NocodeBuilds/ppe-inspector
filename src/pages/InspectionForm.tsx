
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, Save, Check, X, AlertTriangle, SendHorizontal, Download, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { PPEItem, InspectionCheckpoint, CheckpointStatus } from '@/types';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';

const InspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [ppe, setPpe] = useState<PPEItem | null>(null);
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [checkpointStatuses, setCheckpointStatuses] = useState<CheckpointStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallResult, setOverallResult] = useState<'pass' | 'fail'>('pass');
  const [notes, setNotes] = useState('');
  const [inspectionDate, setInspectionDate] = useState<Date>(new Date());
  const [inspectionType, setInspectionType] = useState<'pre-use' | 'monthly' | 'quarterly'>('pre-use');
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const signatureRef = useRef(null);
  
  useEffect(() => {
    if (ppeId) {
      fetchPPEItem();
    }
  }, [ppeId]);
  
  useEffect(() => {
    if (ppe?.type) {
      fetchCheckpoints(ppe.type);
    }
  }, [ppe]);
  
  const fetchPPEItem = async () => {
    if (!ppeId) return;
    
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', ppeId)
        .single();
        
      if (error) throw error;
      
      // Convert from database format to frontend format
      const ppeItem: PPEItem = {
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
        nextInspection: data.next_inspection || undefined
      };
      
      setPpe(ppeItem);
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      toast({
        title: 'Error',
        description: 'Failed to load PPE item',
        variant: 'destructive',
      });
    }
  };
  
  const fetchCheckpoints = async (ppeType: string) => {
    try {
      const { data, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeType);
        
      if (error) throw error;
      
      // Initialize all checkpoints with default status
      const checkpointsData = data.map(cp => ({
        id: cp.id,
        description: cp.description,
        ppeType: cp.ppe_type
      }));
      
      setCheckpoints(checkpointsData);
      
      // Initialize checkpoint statuses
      const initialStatuses: CheckpointStatus[] = checkpointsData.map(cp => ({
        checkpointId: cp.id,
        status: 'na', // Default to NA
        notes: ''
      }));
      
      setCheckpointStatuses(initialStatuses);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error fetching checkpoints:', error);
      toast({
        title: 'Error',
        description: 'Failed to load inspection checkpoints',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };
  
  const updateCheckpointStatus = (checkpointId: string, status: 'ok' | 'not-ok' | 'na') => {
    setCheckpointStatuses(prev => 
      prev.map(cp => 
        cp.checkpointId === checkpointId 
          ? { ...cp, status } 
          : cp
      )
    );
    
    // Update overall result if any checkpoint is marked as 'not-ok'
    if (status === 'not-ok') {
      setOverallResult('fail');
    } else {
      // Check if all remaining checkpoints are 'ok' or 'na'
      const hasFailedCheckpoints = checkpointStatuses.some(
        cp => cp.checkpointId !== checkpointId && cp.status === 'not-ok'
      );
      
      if (!hasFailedCheckpoints) {
        setOverallResult('pass');
      }
    }
  };
  
  const updateCheckpointNotes = (checkpointId: string, notes: string) => {
    setCheckpointStatuses(prev => 
      prev.map(cp => 
        cp.checkpointId === checkpointId 
          ? { ...cp, notes } 
          : cp
      )
    );
  };
  
  const capturePhoto = async (checkpointId: string) => {
    // Mock implementation - would be replaced with actual camera API
    toast({
      title: 'Camera Feature',
      description: 'Camera functionality will be implemented soon',
    });
  };
  
  const handleSignatureEnd = (signatureData: string) => {
    setSignatureImage(signatureData);
    setSignatureDialogOpen(false);
  };
  
  const submitInspection = async () => {
    if (!profile || !ppe) return;
    
    setSubmitting(true);
    
    try {
      // Create inspection record
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppe.id,
          inspector_id: profile.id,
          type: inspectionType,
          date: format(inspectionDate, 'yyyy-MM-dd'),
          overall_result: overallResult,
          notes,
          signature_url: signatureImage
        })
        .select()
        .single();
        
      if (inspectionError) throw inspectionError;
      
      // Create inspection results for each checkpoint
      const inspectionResults = checkpointStatuses.map(status => ({
        inspection_id: inspectionData.id,
        checkpoint_id: status.checkpointId,
        passed: status.status === 'ok',
        notes: status.notes || null,
        photo_url: status.photoUrl || null
      }));
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsErrors);
        
      if (resultsError) throw resultsError;
      
      // Update PPE item with last inspection date and next inspection date
      let nextInspectionDate = new Date(inspectionDate);
      
      switch (inspectionType) {
        case 'pre-use':
          // No change to next inspection date for pre-use
          break;
        case 'monthly':
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 3);
          break;
      }
      
      const { error: ppeUpdateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: format(inspectionDate, 'yyyy-MM-dd'),
          next_inspection: format(nextInspectionDate, 'yyyy-MM-dd'),
          status: overallResult === 'pass' ? 'active' : 'flagged'
        })
        .eq('id', ppe.id);
        
      if (ppeUpdateError) throw ppeUpdateError;
      
      // Show success dialog
      setShowSuccessDialog(true);
      
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit inspection',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const downloadReport = () => {
    // Mock implementation
    toast({
      title: 'Download Feature',
      description: 'PDF/Excel download will be implemented soon',
    });
  };
  
  const shareReport = () => {
    // Mock implementation
    toast({
      title: 'Share Feature',
      description: 'Sharing via WhatsApp/Email will be implemented soon',
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!ppe) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">PPE not found</h1>
        <p className="mt-2">The requested PPE item could not be found.</p>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="sticky top-0 bg-background z-10 p-4 border-b">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-xl font-bold">Inspect PPE</h1>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <Card className="p-4">
          <h2 className="font-semibold text-lg">{ppe.type}</h2>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <p className="text-muted-foreground">Serial Number</p>
              <p>{ppe.serialNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Brand</p>
              <p>{ppe.brand}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Model</p>
              <p>{ppe.modelNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Expiry Date</p>
              <p>{new Date(ppe.expiryDate).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Inspection Date</label>
            <DatePicker 
              date={inspectionDate} 
              setDate={(date) => date && setInspectionDate(date)} 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Inspection Type</label>
            <RadioGroup 
              value={inspectionType} 
              onValueChange={(value) => setInspectionType(value as 'pre-use' | 'monthly' | 'quarterly')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pre-use" id="pre-use" />
                <Label htmlFor="pre-use">Pre-use</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">Monthly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="quarterly" id="quarterly" />
                <Label htmlFor="quarterly">Quarterly</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h2 className="font-semibold mb-4">Inspection Checkpoints</h2>
          <div className="space-y-4">
            {checkpoints.map((checkpoint) => (
              <Card key={checkpoint.id} className="p-4">
                <div className="flex flex-col space-y-3">
                  <p className="font-medium">{checkpoint.description}</p>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => updateCheckpointStatus(checkpoint.id, 'ok')}
                      variant="outline"
                      className={`flex-1 ${checkpointStatuses.find(s => s.checkpointId === checkpoint.id)?.status === 'ok' ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
                    >
                      <Check size={16} className="mr-1" />
                      OK
                    </Button>
                    
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => updateCheckpointStatus(checkpoint.id, 'not-ok')}
                      variant="outline"
                      className={`flex-1 ${checkpointStatuses.find(s => s.checkpointId === checkpoint.id)?.status === 'not-ok' ? 'bg-red-500 text-white hover:bg-red-600' : ''}`}
                    >
                      <X size={16} className="mr-1" />
                      NOT OK
                    </Button>
                    
                    <Button 
                      type="button"
                      size="sm"
                      onClick={() => updateCheckpointStatus(checkpoint.id, 'na')}
                      variant="outline"
                      className={`flex-1 ${checkpointStatuses.find(s => s.checkpointId === checkpoint.id)?.status === 'na' ? 'bg-gray-500 text-white hover:bg-gray-600' : ''}`}
                    >
                      N/A
                    </Button>
                    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => capturePhoto(checkpoint.id)}
                      className="p-2"
                    >
                      <Camera size={16} />
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Add remarks..."
                    value={checkpointStatuses.find(s => s.checkpointId === checkpoint.id)?.notes || ''}
                    onChange={(e) => updateCheckpointNotes(checkpoint.id, e.target.value)}
                    className="h-20"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold mb-2">Overall Notes</h2>
          <Textarea
            placeholder="Add overall notes about the inspection..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-24"
          />
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${overallResult === 'pass' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="font-medium">
              Overall: {overallResult === 'pass' ? 'PASS' : 'FAIL'}
            </span>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setSignatureDialogOpen(true)}
            className="flex items-center"
          >
            {signatureImage ? 'Change Signature' : 'Add Signature'}
          </Button>
        </div>
        
        <div className="flex justify-center pt-4">
          <Button
            disabled={!signatureImage || submitting}
            onClick={submitInspection}
            className="w-full md:w-auto"
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              <span className="flex items-center">
                <Save size={16} className="mr-2" />
                Submit Inspection
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Signature Dialog */}
      <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Your Signature</DialogTitle>
          </DialogHeader>
          <div className="border border-gray-300 rounded-md p-2 w-full h-40 mb-4">
            <SignatureCanvas onEnd={handleSignatureEnd} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <Check size={20} className="mr-2" />
              Inspection Successfully Submitted
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center">
              The inspection has been successfully recorded in the system.
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              className="flex-1 justify-center"
              onClick={downloadReport}
            >
              <Download size={16} className="mr-2" />
              Download Report
            </Button>
            <Button 
              variant="outline"
              className="flex-1 justify-center"
              onClick={shareReport}
            >
              <Share size={16} className="mr-2" />
              Share Report
            </Button>
            <Button 
              className="flex-1 justify-center"
              onClick={() => navigate('/equipment')}
            >
              <CheckCheckIcon size={16} className="mr-2" />
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InspectionForm;
