import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { FileText, BarChart2, Calendar, Download } from 'lucide-react';
import { 
  generatePPEReport, 
  generateInspectionsReport, 
  generateAnalyticsReport 
} from '@/utils/reportGenerator';

interface SummaryStats {
  totalPPE: number;
  totalInspections: number;
  passRate: number;
  flaggedItems: number;
}

interface RecentInspection {
  id: string;
  ppe_items?: {
    serial_number: string;
    type: string;
  };
  pass_fail: boolean;
  inspection_date: string;
}

const ReportsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ppeItems, setPpeItems] = useState<PPEItem[]>([]);
  const [recentInspections, setRecentInspections] = useState<RecentInspection[]>([]);
  const [summary, setSummary] = useState<SummaryStats>({
    totalPPE: 0,
    totalInspections: 0,
    passRate: 0,
    flaggedItems: 0
  });
  
  const [reportStartDate, setReportStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  
  const [reportEndDate, setReportEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const { toast } = useToast();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all PPE items for the inventory report
      const { data: ppeData, error: ppeError } = await supabase
        .from('ppe_items')
        .select('*')
        .order('type');
      
      if (ppeError) throw ppeError;
      
      // Map data to PPEItem type
      const mappedItems: PPEItem[] = ppeData.map((item: any) => ({
        id: item.id,
        serialNumber: item.serial_number,
        type: item.type,
        brand: item.brand,
        modelNumber: item.model_number,
        manufacturingDate: item.manufacturing_date,
        expiryDate: item.expiry_date,
        status: item.status,
        imageUrl: item.image_url,
        nextInspection: item.next_inspection,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
      
      setPpeItems(mappedItems);
      
      // Fetch recent inspections
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .select(`
          *,
          ppe_items (serial_number, type)
        `)
        .order('inspection_date', { ascending: false })
        .limit(10);
      
      if (inspectionError) throw inspectionError;
      
      setRecentInspections(inspectionData);
      
      // Calculate summary statistics
      // Total PPE
      const totalPPE = ppeData.length;
      
      // Total inspections
      const { count: totalInspections, error: inspCountError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true });
      
      if (inspCountError) throw inspCountError;
      
      // Pass rate
      const { count: passedInspections, error: passCountError } = await supabase
        .from('inspections')
        .select('*', { count: 'exact', head: true })
        .eq('pass_fail', true);
      
      if (passCountError) throw passCountError;
      
      const passRate = totalInspections ? Math.round((passedInspections / totalInspections) * 100) : 0;
      
      // Flagged items
      const { count: flaggedItems, error: flaggedCountError } = await supabase
        .from('ppe_items')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'flagged');
      
      if (flaggedCountError) throw flaggedCountError;
      
      setSummary({
        totalPPE,
        totalInspections: totalInspections || 0,
        passRate,
        flaggedItems: flaggedItems || 0
      });
      
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInventoryReport = async () => {
    try {
      // Find first item to generate a sample report
      if (ppeItems.length === 0) {
        toast({
          title: 'Error',
          description: 'No equipment found to generate report',
          variant: 'destructive',
        });
        return;
      }
      
      const itemId = ppeItems[0].id;
      await generatePPEReport(itemId);
      
      toast({
        title: 'Report Generated',
        description: 'Inventory report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating inventory report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate inventory report',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateInspectionsReport = async () => {
    try {
      const startDate = new Date(reportStartDate);
      const endDate = new Date(reportEndDate);
      
      if (startDate > endDate) {
        toast({
          title: 'Invalid Date Range',
          description: 'Start date must be before end date',
          variant: 'destructive',
        });
        return;
      }
      
      await generateInspectionsReport(startDate, endDate);
      
      toast({
        title: 'Report Generated',
        description: 'Inspections report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating inspections report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate inspections report',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateAnalyticsReport = async () => {
    try {
      await generateAnalyticsReport();
      
      toast({
        title: 'Report Generated',
        description: 'Analytics report has been downloaded',
      });
    } catch (error) {
      console.error('Error generating analytics report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate analytics report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total PPE Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.totalPPE}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Inspections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.totalInspections}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Inspection Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.passRate}%</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Flagged Items</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{summary.flaggedItems}</p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="inventory">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
              <TabsTrigger value="inspections">Inspection Reports</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Equipment Inventory Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    Generate a report of all PPE equipment in the system, including their status, expiry dates, and inspection history.
                  </p>
                  
                  <div className="mb-6">
                    <h3 className="text-sm font-medium mb-2">Equipment by Type</h3>
                    <div className="space-y-2">
                      {Array.from(new Set(ppeItems.map(item => item.type))).map(type => {
                        const count = ppeItems.filter(item => item.type === type).length;
                        return (
                          <div key={type} className="flex justify-between items-center">
                            <span>{type}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleGenerateInventoryReport}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Inventory Report
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inspections">
              <Card>
                <CardHeader>
                  <CardTitle>Inspection Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    Generate reports for inspections conducted during a specific date range.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                        Start Date
                      </label>
                      <Input
                        id="startDate"
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium mb-1">
                        End Date
                      </label>
                      <Input
                        id="endDate"
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleGenerateInspectionsReport}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Generate Inspection Report
                  </Button>
                  
                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Recent Inspections</h3>
                    <div className="space-y-2">
                      {recentInspections.length > 0 ? (
                        recentInspections.map((inspection) => (
                          <div key={inspection.id} className="flex justify-between items-center text-sm border-b pb-2">
                            <div>
                              <span className="font-medium">{inspection.ppe_items?.type}</span>
                              <span className="text-muted-foreground ml-2">
                                {inspection.ppe_items?.serial_number}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={inspection.pass_fail ? "text-green-500" : "text-destructive"}>
                                {inspection.pass_fail ? "PASS" : "FAIL"}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(inspection.inspection_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No recent inspections found.</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-muted-foreground">
                    Generate a comprehensive analytics report showing trends, statistics, and insights about your PPE inventory and inspections.
                  </p>
                  
                  <div className="mb-6 space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Inspection Pass Rate</h3>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${summary.passRate}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm text-muted-foreground mt-1">
                        {summary.passRate}%
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Flagged Items Rate</h3>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className="bg-destructive h-2.5 rounded-full" 
                          style={{ width: `${summary.totalPPE ? (summary.flaggedItems / summary.totalPPE) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-right text-sm text-muted-foreground mt-1">
                        {summary.totalPPE ? Math.round((summary.flaggedItems / summary.totalPPE) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={handleGenerateAnalyticsReport}>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Generate Analytics Report
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
