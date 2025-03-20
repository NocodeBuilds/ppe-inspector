
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInspectionHistory } from '@/hooks/useInspectionHistory';
import InspectionList from '@/components/inspections/InspectionList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';

interface EquipmentInspectionHistoryProps {
  ppeId: string;
  ppeSerial?: string;
}

const EquipmentInspectionHistory: React.FC<EquipmentInspectionHistoryProps> = ({
  ppeId,
  ppeSerial
}) => {
  const { inspections, isLoading, error } = useInspectionHistory({ 
    ppeId, 
    limit: 5 
  });
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Inspection History</span>
          {ppeSerial && (
            <Button 
              variant="outline" 
              size="sm" 
              asChild
              className="text-xs h-8"
            >
              <Link to={`/inspect/${ppeSerial}`}>
                <PlusCircle className="h-3.5 w-3.5 mr-1" />
                New Inspection
              </Link>
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <InspectionList
          inspections={inspections}
          isLoading={isLoading}
          showFilters={false}
          title={undefined}
          emptyMessage="No inspection history found for this equipment"
        />
        
        {(inspections && inspections.length > 0) && (
          <Button 
            variant="link" 
            className="mt-2 p-0 h-auto text-sm"
            asChild
          >
            <Link to={`/reports/inspections?ppeId=${ppeId}`}>
              View All Inspection Records
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentInspectionHistory;
