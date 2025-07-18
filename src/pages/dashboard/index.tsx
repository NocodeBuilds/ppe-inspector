import React from 'react';
import { Link } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  Clock, 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  CheckCircle,
  Plus,
  ArrowRight
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth.tsx';

// Example data for demo purposes
const dashboardStats = [
  {
    title: 'Total Inspections',
    value: 248,
    icon: <ClipboardCheck className="h-5 w-5 text-primary" />,
    change: '+12% from last month',
    positive: true,
  },
  {
    title: 'Pending Inspections',
    value: 8,
    icon: <Clock className="h-5 w-5 text-warning" />,
    change: '-3% from last month',
    positive: true,
  },
  {
    title: 'Failed Items',
    value: 5,
    icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
    change: '+2% from last month',
    positive: false,
  },
  {
    title: 'Inspection Rate',
    value: '98%',
    icon: <CheckCircle2 className="h-5 w-5 text-success" />,
    change: 'Same as last month',
    positive: true,
  },
];

const recentInspections = [
  {
    id: 'INS-001',
    type: 'Harness Inspection',
    date: '2025-05-13T09:30:00Z',
    inspector: 'John Doe',
    status: 'passed',
  },
  {
    id: 'INS-002',
    type: 'Helmet Inspection',
    date: '2025-05-12T11:15:00Z',
    inspector: 'Sarah Smith',
    status: 'failed',
  },
  {
    id: 'INS-003',
    type: 'Lanyard Inspection',
    date: '2025-05-11T14:20:00Z',
    inspector: 'Michael Brown',
    status: 'passed',
  },
  {
    id: 'INS-004',
    type: 'Gloves Inspection',
    date: '2025-05-10T10:00:00Z',
    inspector: 'John Doe',
    status: 'passed',
  },
];

const scheduledInspections = [
  {
    id: 'SCH-001',
    type: 'Harness Inspection',
    date: '2025-05-15T09:30:00Z',
    assignedTo: 'John Doe',
    location: 'Building A',
  },
  {
    id: 'SCH-002',
    type: 'Safety Boots Inspection',
    date: '2025-05-16T11:15:00Z',
    assignedTo: 'Sarah Smith',
    location: 'Building B',
  },
  {
    id: 'SCH-003',
    type: 'Safety Goggles Inspection',
    date: '2025-05-17T14:20:00Z',
    assignedTo: 'Michael Brown',
    location: 'Building A',
  },
];

// Function to format dates
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function DashboardPage() {
  const { user } = useAuth();
  const [inspectionCompletion, setInspectionCompletion] = React.useState(75);

  // Display the user's first name if available, otherwise use "there"
  const userFirstName = user?.user_metadata?.firstName || 'there';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userFirstName}!</h1>
        <p className="text-body-lg text-muted-foreground">
          Here's what's happening with your PPE inspections today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.positive ? 'text-success' : 'text-destructive'}`}>
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Inspections</CardTitle>
            <CardDescription>
              Your most recent inspection activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{inspection.type}</p>
                    <div className="flex items-center text-body-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(inspection.date)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inspection.status as any} />
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/inspections/${inspection.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/inspections">
                View All Inspections
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Inspections</CardTitle>
            <CardDescription>
              Scheduled inspections for the next 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scheduledInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{inspection.type}</p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-body-sm text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(inspection.date)}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status="scheduled" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <Link to="/inspections/create">
                <Plus className="mr-2 h-4 w-4" />
                Create New Inspection
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>Your inspection completion rate this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Monthly Target</div>
                    <div className="text-sm text-muted-foreground">{inspectionCompletion}% complete</div>
                  </div>
                  <Progress value={inspectionCompletion} variant="success" showValue />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1 rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-xl font-bold text-success">24</p>
                  </div>
                  <div className="space-y-1 rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-xl font-bold text-warning">8</p>
                  </div>
                  <div className="space-y-1 rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">32</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Your team's compliance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Overall Compliance</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={92} variant="success" className="flex-1" />
                    <span className="text-sm font-medium">92%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Harness Compliance</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={96} variant="success" className="flex-1" />
                    <span className="text-sm font-medium">96%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Helmet Compliance</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={88} variant="success" className="flex-1" />
                    <span className="text-sm font-medium">88%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Gloves Compliance</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={75} variant="warning" className="flex-1" />
                    <span className="text-sm font-medium">75%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Status</CardTitle>
              <CardDescription>Status of your PPE equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Harnesses</p>
                      <Badge variant="outline">42 items</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <p className="text-sm text-success">38 OK</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">4 Need Attention</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Helmets</p>
                      <Badge variant="outline">56 items</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <p className="text-sm text-success">53 OK</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">3 Need Attention</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Lanyards</p>
                      <Badge variant="outline">38 items</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <p className="text-sm text-success">35 OK</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">3 Need Attention</p>
                    </div>
                  </div>
                  <div className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Gloves</p>
                      <Badge variant="outline">72 items</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <p className="text-sm text-success">65 OK</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                      <p className="text-sm text-destructive">7 Need Attention</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/equipment">
                  Manage Equipment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DashboardPage;
