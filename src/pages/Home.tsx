
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [stats, setStats] = useState({
    upcomingInspections: 0,
    expiringPPE: 0
  });
  const { profile } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get upcoming inspections count
        const today = new Date().toISOString();
        const { count: upcomingCount, error: upcomingError } = await supabase
          .from('ppe_items')
          .select('id', { count: 'exact', head: true })
          .gte('next_inspection', today);
          
        if (upcomingError) throw upcomingError;
        
        // Get expiring PPE count
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { count: expiringCount, error: expiringError } = await supabase
          .from('ppe_items')
          .select('id', { count: 'exact', head: true })
          .or(`status.eq.expired,expiry_date.lte.${thirtyDaysFromNow.toISOString()}`);
          
        if (expiringError) throw expiringError;
        
        setStats({
          upcomingInspections: upcomingCount || 0,
          expiringPPE: expiringCount || 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    
    fetchStats();
  }, []);
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center mt-6 fade-in">
        <span className="text-primary">PPE</span> Inspector Pro
      </h1>
      
      {profile && (
        <div className="mb-6 fade-in">
          <p className="text-center text-muted-foreground">
            Welcome back, <span className="font-semibold">{profile.full_name || 'User'}</span>
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          to="/equipment"
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
          description={`${stats.upcomingInspections} inspection${stats.upcomingInspections !== 1 ? 's' : ''} due`}
          icon={<Calendar size={28} className="text-primary-foreground" />}
          iconBgColor="bg-warning"
          className="slide-up"
        />
        
        <DashboardCard
          to="/expiring"
          title="Expiring PPE"
          description={`${stats.expiringPPE} item${stats.expiringPPE !== 1 ? 's' : ''} need attention`}
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
