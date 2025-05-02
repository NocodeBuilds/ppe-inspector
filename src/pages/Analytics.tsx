import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StandardCard } from '@/components/ui/standard-card';
import { PieChart, BarChart3, ClipboardCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  name: string;
  value: number;
}

const Analytics = () => {
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [typeData, setTypeData] = useState<ChartData[]>([]);
  const [inspectionData, setInspectionData] = useState<ChartData[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: status, error: statusError } = await supabase
        .from('ppe_items')
        .select('status');

      if (statusError) throw statusError;

      const statusCounts: { [key: string]: number } = {};
      status.forEach(item => {
        const itemStatus = item.status || 'unknown';
        statusCounts[itemStatus] = (statusCounts[itemStatus] || 0) + 1;
      });

      const formattedStatusData: ChartData[] = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setStatusData(formattedStatusData);

      const { data: types, error: typeError } = await supabase
        .from('ppe_items')
        .select('type');

      if (typeError) throw typeError;

      const typeCounts: { [key: string]: number } = {};
      types.forEach(item => {
        typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      });

      const formattedTypeData: ChartData[] = Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setTypeData(formattedTypeData);

      const { data: inspections, error: inspectionError } = await supabase
        .from('inspections')
        .select('overall_result');

      if (inspectionError) throw inspectionError;

      const inspectionCounts: { [key: string]: number } = {};
      inspections.forEach(item => {
        const result = item.overall_result || 'unknown';
        inspectionCounts[result] = (inspectionCounts[result] || 0) + 1;
      });

      const formattedInspectionData: ChartData[] = Object.entries(inspectionCounts).map(([name, value]) => ({
        name,
        value,
      }));
      setInspectionData(formattedInspectionData);

    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load analytics data',
        variant: 'destructive',
      });
    }
  };

  const StatusBreakdownChart = ({ data }: { data: ChartData[] }) => {
    return (
      <div className="flex flex-col items-center">
        {data.map((item) => (
          <div key={item.name} className="text-sm">
            {item.name}: {item.value}
          </div>
        ))}
      </div>
    );
  };

  const TypeDistributionChart = ({ data }: { data: ChartData[] }) => {
    return (
      <div className="flex flex-col items-center">
        {data.map((item) => (
          <div key={item.name} className="text-sm">
            {item.name}: {item.value}
          </div>
        ))}
      </div>
    );
  };

  const InspectionResultsChart = ({ data }: { data: ChartData[] }) => {
    return (
      <div className="flex flex-col items-center">
        {data.map((item) => (
          <div key={item.name} className="text-sm">
            {item.name}: {item.value}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StandardCard 
          title="PPE Status Breakdown" 
          className="col-span-1"
          icon={<PieChart size={20} />}
        >
          <StatusBreakdownChart data={statusData} />
        </StandardCard>
        
        <StandardCard 
          title="PPE by Type" 
          className="col-span-1" 
          icon={<BarChart3 size={20} />}
        >
          <TypeDistributionChart data={typeData} />
        </StandardCard>
        
        <StandardCard 
          title="Inspection Results" 
          className="col-span-1" 
          icon={<ClipboardCheck size={20} />}
        >
          <InspectionResultsChart data={inspectionData} />
        </StandardCard>
      </div>
    </div>
  );
};

export default Analytics;
