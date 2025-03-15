
import React, { useState, useEffect } from 'react';
import { Plus, Shield, Calendar, AlertTriangle, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import EnhancedCard from '@/components/ui/enhanced-card';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

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
    <div>
      {profile && (
        <div className="mb-3 sm:mb-4 fade-in">
          <p className="text-center text-sm">
            Welcome, <span className="font-semibold">{profile.full_name || 'User'}</span>
          </p>
        </div>
      )}
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto">
          {(isAdmin || isUser) && (
            <div className="slide-up">
              <Button
                variant="outline"
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
                border border-success/30 hover:border-success/50 hover:-translate-y-0.5 transition-all 
                bg-gradient-to-br from-background to-success/5"
                onClick={() => setShowAddPPE(true)}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success rounded-full flex items-center justify-center 
                shadow-sm transition-transform duration-200 hover:scale-105">
                  <Plus size={20} className="text-primary-foreground" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm sm:text-base">Add PPE</div>
                  <div className="text-xs text-muted-foreground">New equipment</div>
                </div>
              </Button>
            </div>
          )}
          
          <div className="slide-up">
            <Button
              variant="outline"
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
              border border-blue-200 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-800 
              hover:-translate-y-0.5 transition-all bg-gradient-to-br from-background to-blue-50 dark:from-background dark:to-blue-950/20"
              onClick={() => navigate('/equipment')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center
              shadow-sm transition-transform duration-200 hover:scale-105">
                <Shield size={20} className="text-primary-foreground" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm sm:text-base">Equipment</div>
                <div className="text-xs text-muted-foreground">
                  {stats.totalEquipment} items
                </div>
              </div>
            </Button>
          </div>
          
          <div className="slide-up">
            <Button
              variant="outline"
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
              border border-amber-200 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-800
              hover:-translate-y-0.5 transition-all bg-gradient-to-br from-background to-amber-50 dark:from-background dark:to-amber-950/20"
              onClick={() => navigate('/upcoming')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center
              shadow-sm transition-transform duration-200 hover:scale-105">
                <Calendar size={20} className="text-primary-foreground" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm sm:text-base">Upcoming</div>
                <div className="text-xs text-muted-foreground">
                  {stats.upcomingInspections} due
                </div>
              </div>
            </Button>
          </div>
          
          <div className="slide-up">
            <Button
              variant="outline"
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
              border border-red-200 dark:border-red-900 hover:border-red-300 dark:hover:border-red-800
              hover:-translate-y-0.5 transition-all bg-gradient-to-br from-background to-red-50 dark:from-background dark:to-red-950/20"
              onClick={() => navigate('/expiring')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-500 rounded-full flex items-center justify-center
              shadow-sm transition-transform duration-200 hover:scale-105">
                <AlertTriangle size={20} className="text-primary-foreground" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm sm:text-base">Expiring</div>
                <div className="text-xs text-muted-foreground">
                  {stats.expiringPPE} soon
                </div>
              </div>
            </Button>
          </div>
          
          <div className="slide-up">
            <Button
              variant="outline"
              className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
              border border-orange-200 dark:border-orange-900 hover:border-orange-300 dark:hover:border-orange-800
              hover:-translate-y-0.5 transition-all bg-gradient-to-br from-background to-orange-50 dark:from-background dark:to-orange-950/20"
              onClick={() => navigate('/flagged')}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-full flex items-center justify-center
              shadow-sm transition-transform duration-200 hover:scale-105">
                <AlertTriangle size={20} className="text-primary-foreground" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm sm:text-base">Flagged</div>
                <div className="text-xs text-muted-foreground">
                  {stats.flaggedPPE} items
                </div>
              </div>
            </Button>
          </div>
          
          {(isAdmin || isUser) && (
            <div className="slide-up">
              <Button
                variant="outline"
                className="w-full h-full flex flex-col items-center justify-center gap-2 p-3 sm:p-4
                border border-purple-200 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-800
                hover:-translate-y-0.5 transition-all bg-gradient-to-br from-background to-purple-50 dark:from-background dark:to-purple-950/20"
                onClick={() => navigate('/reports')}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center
                shadow-sm transition-transform duration-200 hover:scale-105">
                  <FileText size={20} className="text-primary-foreground" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm sm:text-base">Reports</div>
                  <div className="text-xs text-muted-foreground">View & export</div>
                </div>
              </Button>
            </div>
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
