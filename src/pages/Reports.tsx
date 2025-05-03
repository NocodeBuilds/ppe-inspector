
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { InspectionHistory } from '@/components/reports/InspectionHistory';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('history');
  const { showToastNotification } = useNotifications();

  const handleShareReport = () => {
    showToastNotification('This feature is not available yet', 'warning', {
      description: 'Report sharing will be available in a future update.'
    });
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and export inspection records</p>
        </div>
      </div>

      <Tabs defaultValue="history" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="history">Inspection History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card className="p-0 overflow-hidden">
            <InspectionHistory />
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Analytics features are under development and will be available soon.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
