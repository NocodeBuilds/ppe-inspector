
import React, { useState, useEffect } from 'react';
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText, AlertCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import DashboardCard from '@/components/dashboard/DashboardCard';
import { Input } from '@/components/ui/input';

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
  const { isAdmin, isUser } = useRoleAccess();
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
    <div className="relative space-y-8 mx-auto max-w-5xl pb-20">
      {/* Header with search and welcome message */}
      <div className="mb-6 fade-in bg-gradient-to-r from-background via-background/90 to-primary/5 rounded-2xl p-6 border border-border/30 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{profile?.full_name ? `Welcome, ${profile.full_name}` : 'Welcome'}</h1>
            <p className="text-muted-foreground mt-1">Manage your safety equipment with ease</p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search equipment..." 
              className="pl-10 pr-4 bg-background border-border/40 focus:border-primary"
              onClick={() => navigate('/equipment')}
            />
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Analytics Dashboard */}
          <section className="mb-8">
            <DashboardAnalytics className="slide-up" />
          </section>
          
          {/* Quick Actions */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              {(isAdmin || isUser) && (
                <Button
                  onClick={() => setShowAddPPE(true)}
                  className="bg-primary/90 hover:bg-primary shadow-sm hover:shadow transition-all duration-200 mt-2 sm:mt-0"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add New Equipment
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {(isAdmin || isUser) && (
                <DashboardCard
                  to="#"
                  onClick={() => setShowAddPPE(true)}
                  icon={<Plus size={20} className="text-primary-foreground" />}
                  title="Add PPE"
                  description="Register new equipment"
                  iconBgColor="bg-success hover:bg-success/90"
                  className="slide-up transform hover:scale-105 transition-all duration-300"
                />
              )}
              
              <DashboardCard
                to="/equipment"
                icon={<Shield size={20} className="text-primary-foreground" />}
                title="Equipment"
                description={`${stats.totalEquipment} items`}
                iconBgColor="bg-blue-500 hover:bg-blue-600"
                className="slide-up transform hover:scale-105 transition-all duration-300"
              />
              
              <DashboardCard
                to="/upcoming"
                icon={<Calendar size={20} className="text-primary-foreground" />}
                title="Upcoming"
                description={`${stats.upcomingInspections} due`}
                iconBgColor="bg-amber-500 hover:bg-amber-600"
                className="slide-up transform hover:scale-105 transition-all duration-300"
              />
              
              <DashboardCard
                to="/expiring"
                icon={<AlertTriangle size={20} className="text-primary-foreground" />}
                title="Expiring"
                description={`${stats.expiringPPE} soon`}
                iconBgColor="bg-red-500 hover:bg-red-600"
                className="slide-up transform hover:scale-105 transition-all duration-300"
              />
              
              <DashboardCard
                to="/flagged"
                icon={<AlertCircle size={20} className="text-primary-foreground" />}
                title="Flagged"
                description={`${stats.flaggedPPE} items`}
                iconBgColor="bg-orange-500 hover:bg-orange-600"
                className="slide-up transform hover:scale-105 transition-all duration-300"
              />
              
              {(isAdmin || isUser) && (
                <DashboardCard
                  to="/reports"
                  icon={<FileText size={20} className="text-primary-foreground" />}
                  title="Reports"
                  description="View & export"
                  iconBgColor="bg-purple-500 hover:bg-purple-600"
                  className="slide-up transform hover:scale-105 transition-all duration-300"
                />
              )}
            </div>
          </section>
        </>
      )}

      <CardOverlay 
        show={showAddPPE} 
        onClose={() => setShowAddPPE(false)}
        title="Add New PPE Equipment"
      >
        <AddPPEForm onSuccess={handleAddPPESuccess} />
      </CardOverlay>
    </div>
  );
};

export default Home;
