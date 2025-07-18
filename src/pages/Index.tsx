
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { 
  ClipboardList, 
  Calendar, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Settings,
  QrCode,
  BarChart
} from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  
  const mainActions = [
    {
      title: 'Upcoming Inspections',
      description: 'View and manage equipment due for inspection',
      icon: <Calendar className="w-12 h-12 text-blue-500" />,
      route: '/upcoming',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Expiring Equipment',
      description: 'Equipment nearing or past expiry date',
      icon: <AlertTriangle className="w-12 h-12 text-amber-500" />,
      route: '/expiring',
      color: 'bg-amber-50 border-amber-200'
    },
    {
      title: 'Flagged Issues',
      description: 'Equipment with identified problems',
      icon: <AlertTriangle className="w-12 h-12 text-red-500" />,
      route: '/flagged',
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'All Equipment',
      description: 'Browse and manage all PPE equipment',
      icon: <ClipboardList className="w-12 h-12 text-green-500" />,
      route: '/equipment',
      color: 'bg-green-50 border-green-200'
    }
  ];
  
  const secondaryActions = [
    {
      title: 'Start Inspection',
      description: 'Begin a new equipment inspection',
      icon: <QrCode className="w-6 h-6" />,
      route: '/start-inspection'
    },
    {
      title: 'Add Equipment',
      description: 'Register new PPE equipment',
      icon: <Plus className="w-6 h-6" />,
      route: '/equipment?action=add'
    },
    {
      title: 'Reports',
      description: 'Generate inspection reports',
      icon: <FileText className="w-6 h-6" />,
      route: '/reports'
    },
    {
      title: 'Analytics',
      description: 'View equipment and inspection statistics',
      icon: <BarChart className="w-6 h-6" />,
      route: '/analytics'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Safety Inspection System</h1>
        <p className="text-muted-foreground">
          Manage personal protective equipment, inspections, and compliance reports
        </p>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Equipment Status</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {mainActions.map((action, index) => (
          <Card 
            key={index} 
            className={`p-6 border shadow-sm hover:shadow-md transition-shadow ${action.color}`}
            onClick={() => navigate(action.route)}
          >
            <div className="flex items-start">
              <div className="mr-4">
                {action.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
                <p className="text-muted-foreground mb-3">{action.description}</p>
                <Button 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.route);
                  }}
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {secondaryActions.map((action, index) => (
          <Card 
            key={index} 
            className="p-4 border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(action.route)}
          >
            <div className="text-center">
              <div className="bg-primary/10 mx-auto rounded-full p-3 w-14 h-14 flex items-center justify-center mb-3">
                {action.icon}
              </div>
              <h3 className="font-medium mb-1">{action.title}</h3>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="mt-10 pt-6 border-t text-center">
        <Button 
          variant="ghost" 
          className="text-muted-foreground"
          onClick={() => navigate('/settings')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Index;
