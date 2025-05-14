import React from 'react';
import { Link } from '@tanstack/react-router';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  FileText, 
  Filter, 
  PieChart, 
  Plus, 
  Printer,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

// Mock chart component - in a real app, you'd use a charting library
const MockBarChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${className} w-full h-64 bg-muted/20 border rounded-md flex items-center justify-center`}>
    <BarChart3 className="h-12 w-12 text-muted-foreground/50" />
  </div>
);

const MockPieChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${className} w-full h-64 bg-muted/20 border rounded-md flex items-center justify-center`}>
    <PieChart className="h-12 w-12 text-muted-foreground/50" />
  </div>
);

// Mock data for equipment compliance
const complianceData = [
  { type: 'Harnesses', compliant: 42, total: 45, percentage: 93 },
  { type: 'Helmets', compliant: 56, total: 60, percentage: 93 },
  { type: 'Lanyards', compliant: 35, total: 38, percentage: 92 },
  { type: 'Safety Glasses', compliant: 65, total: 72, percentage: 90 },
  { type: 'Gloves', compliant: 52, total: 64, percentage: 81 },
];

// Mock data for recent reports
const recentReports = [
  { 
    id: 'rep-001', 
    name: 'Monthly Inspection Summary - April 2025', 
    type: 'Monthly Summary', 
    date: '2025-05-01', 
    format: 'PDF',
    size: '2.4 MB'
  },
  { 
    id: 'rep-002', 
    name: 'Equipment Status Report - Q1 2025', 
    type: 'Quarterly Report', 
    date: '2025-04-15', 
    format: 'XLSX',
    size: '3.1 MB'
  },
  { 
    id: 'rep-003', 
    name: 'Failed Inspections - March 2025', 
    type: 'Compliance Report', 
    date: '2025-04-02', 
    format: 'PDF',
    size: '1.8 MB'
  },
  { 
    id: 'rep-004', 
    name: 'Inspection Due Dates - May 2025', 
    type: 'Schedule Report', 
    date: '2025-04-28', 
    format: 'PDF',
    size: '1.2 MB'
  },
];

// Report template options
const reportTemplates = [
  { id: 'monthly-inspection', name: 'Monthly Inspection Summary' },
  { id: 'equipment-status', name: 'Equipment Status Report' },
  { id: 'compliance', name: 'Compliance Report' },
  { id: 'failed-inspections', name: 'Failed Inspections Report' },
  { id: 'inspector-activity', name: 'Inspector Activity Report' },
  { id: 'equipment-lifecycle', name: 'Equipment Lifecycle Report' },
  { id: 'scheduled-inspections', name: 'Scheduled Inspections Report' },
];

// Time period options for reports
const timePeriods = [
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' },
  { value: 'year-to-date', label: 'Year to Date' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
];

export function ReportsPage() {
  const { toast } = useToast();
  const [timePeriod, setTimePeriod] = React.useState('last-30-days');
  const [selectedReportTemplate, setSelectedReportTemplate] = React.useState('');
  
  const handleGenerateReport = () => {
    if (!selectedReportTemplate) {
      toast({
        title: 'Template Required',
        description: 'Please select a report template',
        variant: 'warning',
      });
      return;
    }
    
    const template = reportTemplates.find(t => t.id === selectedReportTemplate);
    
    toast({
      title: 'Generating Report',
      description: `Preparing ${template?.name}...`,
      variant: 'info',
    });
    
    // In a real app, this would trigger an API call to generate the report
    setTimeout(() => {
      toast({
        title: 'Report Ready',
        description: 'Your report has been generated successfully',
        variant: 'success',
      });
    }, 2000);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-body text-muted-foreground">
          Generate reports and view analytics about your inspections and equipment
        </p>
      </header>
      
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Generate Report</CardTitle>
            <CardDescription>
              Create a new report from our standard templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedReportTemplate} onValueChange={setSelectedReportTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report template" />
              </SelectTrigger>
              <SelectContent>
                {reportTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={timePeriod} onValueChange={setTimePeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {timePeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleGenerateReport}>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Recent Reports</CardTitle>
            <CardDescription>
              Previously generated reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden">
              {recentReports.map((report, index) => (
                <div 
                  key={report.id} 
                  className={`flex items-center justify-between py-3 ${
                    index !== recentReports.length - 1 ? 'border-b' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <p className="text-body font-medium">{report.name}</p>
                    </div>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(report.date)}
                      <span className="mx-2">•</span>
                      <Badge variant="outline" className="text-xs font-normal">
                        {report.format}
                      </Badge>
                      <span className="mx-2">•</span>
                      {report.size}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Download As</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        Excel (.xlsx)
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="h-4 w-4 mr-2" />
                        CSV
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/reports/history">
                View All Reports
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="inspections">Inspections</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Select defaultValue="last-30-days">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                {timePeriods.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Inspection Status Distribution</CardTitle>
                <CardDescription>
                  Distribution of inspection results in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockPieChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Equipment Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all equipment items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockPieChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Inspection Activity</CardTitle>
                <CardDescription>
                  Number of inspections performed over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockBarChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Compliance</CardTitle>
              <CardDescription>
                Percentage of equipment that is compliant with inspection requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {complianceData.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="space-y-1">
                        <p className="text-body font-medium">{item.type}</p>
                        <p className="text-body-sm text-muted-foreground">
                          {item.compliant} of {item.total} compliant
                        </p>
                      </div>
                      <Badge 
                        variant={item.percentage >= 90 ? "success" : item.percentage >= 80 ? "warning" : "destructive"}
                      >
                        {item.percentage}%
                      </Badge>
                    </div>
                    <Progress 
                      value={item.percentage} 
                      variant={item.percentage >= 90 ? "success" : item.percentage >= 80 ? "warning" : "danger"}
                    />
                  </div>
                ))}
                
                <Card className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-body font-medium">Overall Compliance</p>
                        <p className="text-body-sm text-muted-foreground">
                          250 of 279 items compliant
                        </p>
                      </div>
                      <Badge variant="success">90%</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inspections">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inspections By Result</CardTitle>
                <CardDescription>
                  Breakdown of inspection results in the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockBarChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Inspections By Equipment Type</CardTitle>
                <CardDescription>
                  Number of inspections performed on each equipment type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockBarChart />
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Inspector Activity</CardTitle>
                <CardDescription>
                  Number of inspections performed by each inspector
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MockBarChart />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Custom Reports</CardTitle>
            <Button size="sm" asChild>
              <Link to="/reports/custom">
                <Plus className="h-4 w-4 mr-2" />
                New Custom Report
              </Link>
            </Button>
          </div>
          <CardDescription>
            Create and manage custom reports with specific filters and formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Report Name</th>
                  <th className="text-left p-3 font-medium">Description</th>
                  <th className="text-left p-3 font-medium">Filters</th>
                  <th className="text-left p-3 font-medium">Last Generated</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-3 font-medium">
                    Team A Equipment Status
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Status report for all equipment assigned to Team A
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">Team: Team A</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Apr 25, 2025
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm">Generate</Button>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">
                    Building B Compliance Report
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Compliance status for all equipment in Building B
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">Location: Building B</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Apr 22, 2025
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm">Generate</Button>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="p-3 font-medium">
                    Harness Inspection Report
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Detailed inspection history for all harnesses
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">Type: Harness</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    Apr 18, 2025
                  </td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm">Generate</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;
