
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Filter, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FlaggedIssue {
  id: string;
  ppe_serial: string;
  ppe_type: string;
  inspection_date: string;
  checkpoint_description: string;
  inspector_name: string;
  notes: string | null;
}

const FlaggedIssues = () => {
  const [flaggedIssues, setFlaggedIssues] = useState<FlaggedIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedIssues();
  }, [filter]);

  const fetchFlaggedIssues = async () => {
    try {
      setIsLoading(true);
      
      // This would be replaced with an actual query to fetch flagged issues
      // For now, we'll use a simulated response
      
      // Example query:
      // const { data, error } = await supabase
      //   .from('inspection_results')
      //   .select(`
      //     id,
      //     inspections!inner(
      //       date,
      //       ppe_items!inner(serial_number, type),
      //       profiles!inner(full_name)
      //     ),
      //     inspection_checkpoints!inner(description),
      //     passed,
      //     notes
      //   `)
      //   .eq('passed', false)
      //   .order('created_at', { ascending: false });
      
      // Simulated data
      const mockData: FlaggedIssue[] = [
        {
          id: '1',
          ppe_serial: 'HARNESS-001',
          ppe_type: 'Full Body Harness',
          inspection_date: '2023-06-15T09:00:00',
          checkpoint_description: 'Webbing is free from cuts or tears',
          inspector_name: 'John Doe',
          notes: 'Found a 2-inch tear on shoulder strap'
        },
        {
          id: '2',
          ppe_serial: 'HELMET-003',
          ppe_type: 'Safety Helmet',
          inspection_date: '2023-06-12T14:30:00',
          checkpoint_description: 'Shell is free from cracks',
          inspector_name: 'Jane Smith',
          notes: 'Hairline crack on right side'
        },
        {
          id: '3',
          ppe_serial: 'LANYARD-007',
          ppe_type: 'Double Lanyard',
          inspection_date: '2023-06-10T11:15:00',
          checkpoint_description: 'Shock absorber is intact',
          inspector_name: 'Mike Johnson',
          notes: 'Shock absorber partially deployed'
        },
        {
          id: '4',
          ppe_serial: 'GOGGLE-012',
          ppe_type: 'Safety Goggles',
          inspection_date: '2023-06-08T10:00:00',
          checkpoint_description: 'Lens is free from scratches',
          inspector_name: 'Sarah Williams',
          notes: 'Deep scratches affecting visibility'
        }
      ];
      
      if (filter === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        setFlaggedIssues(mockData.filter(issue => 
          new Date(issue.inspection_date) >= oneWeekAgo
        ));
      } else {
        setFlaggedIssues(mockData);
      }
      
    } catch (error: any) {
      console.error('Error fetching flagged issues:', error);
      toast({
        title: 'Error',
        description: 'Failed to load flagged issues',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    toast({
      title: 'Export started',
      description: 'Your export is being prepared',
    });
    
    // Simulate export process
    setTimeout(() => {
      toast({
        title: 'Export complete',
        description: 'Flagged issues report has been downloaded',
      });
    }, 2000);
  };

  const handleViewIssue = (id: string) => {
    // In a real implementation, this would navigate to the inspection details
    navigate(`/inspection/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">Loading flagged issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
            Flagged Issues
          </h1>
          <p className="text-muted-foreground">
            View all PPE items that failed inspection
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilter(filter === 'all' ? 'recent' : 'all')}
          >
            <Filter className="h-4 w-4 mr-1" />
            {filter === 'all' ? 'All Issues' : 'Recent Only'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      {flaggedIssues.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-muted p-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No flagged issues found</h3>
            <p className="text-muted-foreground text-center mt-1">
              All your PPE items have passed their inspections
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {flaggedIssues.map((issue) => (
            <Card key={issue.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {issue.ppe_type} - {issue.ppe_serial}
                    </CardTitle>
                    <CardDescription>
                      Failed checkpoint: {issue.checkpoint_description}
                    </CardDescription>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Issue Details</p>
                    <p className="text-sm text-muted-foreground">{issue.notes}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Inspection Date</span>
                      <span className="text-sm">{format(new Date(issue.inspection_date), 'PPP')}</span>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Inspector</span>
                      <span className="text-sm">{issue.inspector_name}</span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewIssue(issue.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlaggedIssues;
