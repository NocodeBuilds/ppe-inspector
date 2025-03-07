
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import EnhancedCard from '@/components/ui/enhanced-card';

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
  const { isAdmin, isInspector } = useRoleAccess();
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
          <p className="text-center">
            Welcome back, <span className="font-semibold">{profile.full_name || 'User'}</span>
            {profile.role && (
              <span className="ml-2 text-sm px-2 py-1 bg-primary/10 text-primary rounded-full">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            )}
          </p>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(isAdmin || isInspector) && (
            <EnhancedCard
              title="Add PPE"
              description="Add new equipment"
              icon={<Plus size={28} className="text-primary-foreground" />}
              iconBgColor="bg-success"
              iconBorderColor="border-success/20"
              cardBorderColor="border-success/30"
              className="slide-up"
              onClick={() => setShowAddPPE(true)}
            />
          )}
          
          <EnhancedCard
            to="/equipment"
            title="Start Inspection"
            description="Begin inspection"
            icon={<Shield size={28} className="text-primary-foreground" />}
            iconBgColor="bg-blue-500"
            iconBorderColor="border-blue-300"
            cardBorderColor="border-blue-200 dark:border-blue-900"
            className="slide-up"
          />
          
          <EnhancedCard
            to="/upcoming"
            title="Upcoming Inspections"
            description={`${stats.upcomingInspections} inspection${stats.upcomingInspections !== 1 ? 's' : ''} due`}
            icon={<Calendar size={28} className="text-primary-foreground" />}
            iconBgColor="bg-amber-500"
            iconBorderColor="border-amber-300"
            cardBorderColor="border-amber-200 dark:border-amber-900"
            className="slide-up"
          />
          
          <EnhancedCard
            to="/expiring"
            title="Expiring PPE"
            description={`${stats.expiringPPE} item${stats.expiringPPE !== 1 ? 's' : ''} expiring soon`}
            icon={<AlertTriangle size={28} className="text-primary-foreground" />}
            iconBgColor="bg-red-500"
            iconBorderColor="border-red-300"
            cardBorderColor="border-red-200 dark:border-red-900"
            className="slide-up"
          />
          
          <EnhancedCard
            to="/flagged"
            title="Flagged Issues"
            description={`${stats.flaggedPPE} item${stats.flaggedPPE !== 1 ? 's' : ''} need action`}
            icon={<AlertTriangle size={28} className="text-primary-foreground" />}
            iconBgColor="bg-orange-500"
            iconBorderColor="border-orange-300"
            cardBorderColor="border-orange-200 dark:border-orange-900"
            className="slide-up col-span-1"
          />
          
          {isAdmin && (
            <EnhancedCard
              to="/reports"
              title="Reports"
              description="View & download"
              icon={<FileText size={28} className="text-primary-foreground" />}
              iconBgColor="bg-purple-500"
              iconBorderColor="border-purple-300"
              cardBorderColor="border-purple-200 dark:border-purple-900"
              className="slide-up col-span-1"
            />
          )}
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
