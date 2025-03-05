
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText } from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [stats, setStats] = useState({
    upcomingInspections: 0,
    expiringPPE: 0,
    flaggedPPE: 0,
    totalEquipment: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchStats();
  }, []);
  
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Get current date
      const today = new Date().toISOString();
      
      // Get upcoming inspections count
      const { count: upcomingCount, error: upcomingError } = await supabase
        .from('ppe_items')
        .select('id', { count: 'exact', head: true })
        .lte('next_inspection', today);
          
      if (upcomingError) throw upcomingError;
      
      // Get expiring PPE count (within next year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      const { count: expiringCount, error: expiringError } = await supabase
        .from('ppe_items')
        .select('id', { count: 'exact', head: true })
        .or(`status.eq.expired,and(expiry_date.gte.${today},expiry_date.lte.${oneYearFromNow.toISOString()})`);
          
      if (expiringError) throw expiringError;
      
      // Get flagged PPE count
      const { count: flaggedCount, error: flaggedError } = await supabase
        .from('ppe_items')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'flagged');
          
      if (flaggedError) throw flaggedError;
      
      // Get total equipment count
      const { count: totalCount, error: totalError } = await supabase
        .from('ppe_items')
        .select('id', { count: 'exact', head: true });
          
      if (totalError) throw totalError;
      
      setStats({
        upcomingInspections: upcomingCount || 0,
        expiringPPE: expiringCount || 0,
        flaggedPPE: flaggedCount || 0,
        totalEquipment: totalCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPPESuccess = () => {
    setShowAddPPE(false);
    fetchStats();
    toast({
      title: 'Success',
      description: 'PPE item added successfully',
    });
  };
  
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
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
            to="/equipment"
            title="Start Inspection"
            description="Begin inspection"
            icon={<Shield size={28} className="text-primary-foreground" />}
            iconBgColor="bg-info"
            className="slide-up"
            onClick={() => navigate('/equipment')}
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
            description={`${stats.expiringPPE} item${stats.expiringPPE !== 1 ? 's' : ''} expiring soon`}
            icon={<AlertTriangle size={28} className="text-primary-foreground" />}
            iconBgColor="bg-destructive"
            className="slide-up"
          />
          
          <DashboardCard
            to="/flagged"
            title="Flagged Issues"
            description={`${stats.flaggedPPE} item${stats.flaggedPPE !== 1 ? 's' : ''} need action`}
            icon={<AlertTriangle size={28} className="text-primary-foreground" />}
            iconBgColor="bg-destructive"
            className="slide-up col-span-1"
          />
          
          <DashboardCard
            to="/reports"
            title="Reports"
            description="View & download"
            icon={<FileText size={28} className="text-primary-foreground" />}
            iconBgColor="bg-accent"
            className="slide-up col-span-1"
          />
        </div>
      )}

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
        <AddPPEForm onSuccess={handleAddPPESuccess} />
      </CardOverlay>
    </div>
  );
};

export default Home;
