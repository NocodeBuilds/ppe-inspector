
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';

const Home = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center mt-6 fade-in">
        <span className="text-primary">PPE</span> Inspector Pro
      </h1>
      
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          to="/add-ppe"
          title="Add PPE"
          description="Add new equipment"
          icon={<Plus size={28} className="text-primary-foreground" />}
          iconBgColor="bg-success"
          className="slide-up"
          onClick={() => setShowAddPPE(true)}
        />
        
        <DashboardCard
          to="/inspect"
          title="Start Inspection"
          description="Begin inspection"
          icon={<Shield size={28} className="text-primary-foreground" />}
          iconBgColor="bg-info"
          className="slide-up"
        />
        
        <DashboardCard
          to="/upcoming"
          title="Upcoming Inspections"
          description="9 inspections due"
          icon={<Calendar size={28} className="text-primary-foreground" />}
          iconBgColor="bg-warning"
          className="slide-up"
        />
        
        <DashboardCard
          to="/expiring"
          title="Expiring PPE"
          description="3 items need attention"
          icon={<AlertTriangle size={28} className="text-primary-foreground" />}
          iconBgColor="bg-destructive"
          className="slide-up"
        />
        
        <DashboardCard
          to="/reports"
          title="Reports"
          description="View & download"
          icon={<FileText size={28} className="text-primary-foreground" />}
          iconBgColor="bg-accent"
          className="slide-up col-span-1"
        />
        
        <DashboardCard
          to="/exports"
          title="Export Data"
          description="PDF & Excel files"
          icon={<Download size={28} className="text-primary-foreground" />}
          iconBgColor="bg-secondary"
          className="slide-up col-span-1"
        />
      </div>

      <CardOverlay show={showAddPPE} onClose={() => setShowAddPPE(false)}>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Add New PPE</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAddPPE(false)}
            className="h-8 w-8 p-0 rounded-full"
          >
            ✕
          </Button>
        </div>
        <AddPPEForm onSuccess={() => setShowAddPPE(false)} />
      </CardOverlay>
    </div>
  );
};

export default Home;
