import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, PPEType } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';

const PPE_TYPES: PPEType[] = [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection'
];

interface CheckpointItem {
  id: string;
  description: string;
  passed: boolean;
}

const ManualInspection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const prefilledSerialNumber = location.state?.serialNumber || '';

  const [serialNumber, setSerialNumber] = useState(prefilledSerialNumber);
  const [ppeType, setPpeType] = useState<PPEType | ''>('');
  const [brand, setBrand] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [notes, setNotes] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointItem[]>([]);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPPESearched, setIsPPESearched] = useState(false);
  const [foundPPE, setFoundPPE] = useState<PPEItem | null>(null);

  useEffect(() => {
    if (prefilledSerialNumber) {
      searchPPE(prefilledSerialNumber);
    }
  }, [prefilledSerialNumber]);

  useEffect(() => {
    if (ppeType) {
      fetchCheckpoints(ppeType);
    }
  }, [ppeType]);

  const searchPPE = async (serial: string) => {
    try {
      setError(null);
      
      const { data, error: searchError } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', serial)
        .maybeSingle();
      
      if (searchError) throw searchError;
      
      setIsPPESearched(true);
      
      if (data) {
        setFoundPPE(data);
        fillFormWithPPEData(data);
        toast({
          title: 'PPE Found',
          description: `Serial number: ${serial}`,
        });
      }
    } catch (error: any) {
      console.error('Error searching for PPE:', error);
      setError(error.message || 'An error occurred while searching');
    }
  };

  const fillFormWithPPEData = (ppe: PPEItem) => {
    setPpeType(ppe.type as PPEType);
    setBrand(ppe.brand || '');
    setModelNumber(ppe.model_number || '');
    if (ppe.manufacturing_date) {
      setManufacturingDate(new Date(ppe.manufacturing_date));
    }
    if (ppe.expiry_date) {
      setExpiryDate(new Date(ppe.expiry_date));
    }
  };

  const fetchCheckpoints = async (type: PPEType) => {
    try {
      const { data, error: checkpointsError } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', type);
      
      if (checkpointsError) throw checkpointsError;
      
      if (data && data.length > 0) {
        setCheckpoints(data.map(cp => ({
          id: cp.id,
          description: cp.description,
          passed: false
        })));
      } else {
        setCheckpoints([
          { id: 'default-1', description: 'General condition is good', passed: false },
          { id: 'default-2', description: 'No visible damage', passed: false },
          { id: 'default-3', description: 'All components are functional', passed: false }
        ]);
      }
    } catch (error: any) {
      console.error('Error fetching checkpoints:', error);
      setError(error.message || 'An error occurred while fetching checkpoints');
    }
  };

  const toggleCheckpoint = (id: string) => {
    setCheckpoints(
      checkpoints.map(cp => 
        cp.id === id ? { ...cp, passed: !cp.passed } : cp
      )
    );
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      
      if (!serialNumber || !ppeType || !signatureData) {
        setError('Please fill all required fields and add your signature');
        setIsSubmitting(false);
        return;
      }
      
      let ppeId = foundPPE?.id;
      
      if (!ppeId) {
        const { data: newPPE, error: ppeError } = await supabase
          .from('ppe_items')
          .insert({
            serial_number: serialNumber,
            type: ppeType,
            brand,
            model_number: modelNumber,
            manufacturing_date: manufacturingDate?.toISOString(),
            expiry_date: expiryDate?.toISOString(),
            status: 'active',
            last_inspection: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (ppeError) throw ppeError;
        ppeId = newPPE.id;
      }
      
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: '123',
          type: 'pre-use',
          date: new Date().toISOString(),
          overall_result: checkpoints.every(cp => cp.passed) ? 'pass' : 'fail',
          signature_url: signatureData,
          notes
        })
        .select('id')
        .single();
      
      if (inspectionError) throw inspectionError;
      
      const results = checkpoints.map(cp => ({
        inspection_id: inspection.id,
        checkpoint_id: cp.id,
        passed: cp.passed,
        notes: ''
      }));
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(results);
      
      if (resultsError) throw resultsError;
      
      toast({
        title: 'Inspection Complete',
        description: 'The inspection has been successfully recorded.',
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      setError(error.message || 'An error occurred while submitting the inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">New Inspection</h1>
        <p className="text-muted-foreground">Create a new PPE inspection record</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>PPE Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <div className="flex gap-2">
                <Input
                  id="serialNumber"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter serial number"
                  disabled={isPPESearched}
                  className="flex-1"
                />
                {!isPPESearched && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => searchPPE(serialNumber)}
                    disabled={!serialNumber.trim()}
                  >
                    Search
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ppeType">PPE Type *</Label>
              <Select 
                value={ppeType} 
                onValueChange={(value) => setPpeType(value as PPEType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select PPE type" />
                </SelectTrigger>
                <SelectContent>
                  {PPE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Enter brand name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="Enter model number"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Manufacturing Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !manufacturingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {manufacturingDate ? format(manufacturingDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={manufacturingDate}
                      onSelect={setManufacturingDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !expiryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expiryDate ? format(expiryDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      onSelect={setExpiryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {checkpoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Inspection Checkpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {checkpoints.map((checkpoint) => (
                  <div 
                    key={checkpoint.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors", 
                      checkpoint.passed 
                        ? "bg-success/10 border-success/30" 
                        : "bg-destructive/10 border-destructive/30"
                    )}
                    onClick={() => toggleCheckpoint(checkpoint.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                        checkpoint.passed ? "bg-success" : "bg-destructive"
                      )}>
                        {checkpoint.passed ? "✓" : "✗"}
                      </div>
                      <div>
                        <p className="font-medium">{checkpoint.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {checkpoint.passed ? "Pass" : "Fail"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter any additional notes or observations"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inspector Signature *</CardTitle>
          </CardHeader>
          <CardContent>
            <SignatureCanvas 
              onSave={setSignatureData}
              existingSignature={signatureData}
            />
            <p className="text-xs text-muted-foreground mt-2">
              By signing, you certify that this inspection was conducted according to safety standards.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !signatureData}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                  Submitting...
                </div>
              ) : 'Complete Inspection'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ManualInspection;
