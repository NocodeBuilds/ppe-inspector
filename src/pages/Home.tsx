
import React, { useState, useEffect } from 'react';
import { Plus, Shield, Calendar, AlertTriangle, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CardOverlay from '@/components/ui/card-overlay';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';
import DashboardAnalytics from '@/components/dashboard/DashboardAnalytics';
import { useIsMobile } from '@/hooks/use-mobile';

const Home = () => {
  const [showAddPPE, setShowAddPPE] = useState(false);
  const [stats, setStats] = useState({
    upcomingInspections: 0,
    expiringPPE: 0,
    flaggedPPE: 0,
    totalEquipment: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const {
    profile
  } = useAuth();
  const {
    isAdmin,
    isUser
  } = useRoleAccess();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);

      // Get current date and 10 days in the future
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + 10);
      const thresholdDateISO = futureDate.toISOString();

      // Get upcoming inspections count (within next 10 days or past due, any status)
      const {
        count: upcomingCount,
        error: upcomingError
      } = await supabase.from('ppe_items').select('id', {
        count: 'exact',
        head: true
      })
      .lte('next_inspection', thresholdDateISO); // Use 10-day lookahead
      
      if (upcomingError) throw upcomingError;

      // Get expiring PPE count (within next year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      const {
        count: expiringCount,
        error: expiringError
      } = await supabase.from('ppe_items').select('id', {
        count: 'exact',
        head: true
      }).or(`status.eq.expired,and(expiry_date.gte.${today.toISOString()},expiry_date.lte.${oneYearFromNow.toISOString()})`);
      
      if (expiringError) throw expiringError;

      // Get flagged PPE count
      const {
        count: flaggedCount,
        error: flaggedError
      } = await supabase.from('ppe_items').select('id', {
        count: 'exact',
        head: true
      }).eq('status', 'flagged');
      
      if (flaggedError) throw flaggedError;

      // Get total equipment count
      const {
        count: totalCount,
        error: totalError
      } = await supabase.from('ppe_items').select('id', {
        count: 'exact',
        head: true
      });
      
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
        variant: 'destructive'
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
      description: 'PPE item added successfully'
    });
  };

  const iconSize = isMobile ? 18 : 20;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {profile && (
        <div className="flex items-center justify-center mb-3">
          <div>
            <p className="text-base font-medium">
              Welcome, <span className="font-semibold">{profile.full_name || 'User'}</span>
            </p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Analytics Dashboard - Compact Version */}
          <div className="mb-6">
            <DashboardAnalytics className="slide-up" />
          </div>
          
          {/* Section divider to create clear separation */}
          <div className="flex items-center mb-4">
            <div className="flex-grow border-t border-border"></div>
            <span className="px-3 text-sm font-medium text-muted-foreground">Quick Actions</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          
          {/* Quick Actions - Responsive Grid with larger tap targets */}
          <div className="grid grid-cols-2 gap-3 max-w-6xl mx-auto mb-16">
            {(isAdmin || isUser) && (
              <Button 
                variant="outline" 
                onClick={() => setShowAddPPE(true)} 
                className="h-auto flex items-center justify-start gap-3 p-3 border border-success/30 bg-gradient-to-br from-background to-success/5 text-base"
              >
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-sm">
                  <Plus size={iconSize} className="text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-base leading-tight">Add PPE</div>
                  <div className="text-sm text-muted-foreground leading-tight">New equipment</div>
                </div>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start gap-3 p-3 border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-background to-blue-50 dark:from-background dark:to-blue-950/20" 
              onClick={() => navigate('/equipment')}
            >
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                <Shield size={iconSize} className="text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-base leading-tight">Equipment</div>
                <div className="text-sm text-muted-foreground leading-tight">
                  {stats.totalEquipment} items
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start gap-3 p-3 border border-amber-200 dark:border-amber-900 bg-gradient-to-br from-background to-amber-50 dark:from-background dark:to-amber-950/20" 
              onClick={() => navigate('/upcoming')}
            >
              <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
                <Calendar size={iconSize} className="text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-base leading-tight">Upcoming</div>
                <div className="text-sm text-muted-foreground leading-tight">
                  {stats.upcomingInspections} due
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex items-center justify-start gap-3 p-3 border border-red-200 dark:border-red-900 bg-gradient-to-br from-background to-red-50 dark:from-background dark:to-red-950/20" 
              onClick={() => navigate('/expiring')}
            >
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-sm">
                <AlertTriangle size={iconSize} className="text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-base leading-tight">Expiring</div>
                <div className="text-sm text-muted-foreground leading-tight">
                  {stats.expiringPPE} soon
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/flagged')} 
              className="h-auto flex items-center justify-start gap-3 p-3 border border-orange-200 dark:border-orange-900 bg-gradient-to-br from-background to-orange-50 dark:from-background dark:to-orange-950/20"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                <AlertCircle size={iconSize} className="text-primary-foreground" />
              </div>
              <div className="text-left">
                <div className="font-medium text-base leading-tight">Flagged</div>
                <div className="text-sm text-muted-foreground leading-tight">
                  {stats.flaggedPPE} items
                </div>
              </div>
            </Button>
            
            {(isAdmin || isUser) && (
              <Button 
                variant="outline" 
                className="h-auto flex items-center justify-start gap-3 p-3 border border-purple-200 dark:border-purple-900 bg-gradient-to-br from-background to-purple-50 dark:from-background dark:to-purple-950/20" 
                onClick={() => navigate('/reports')}
              >
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center shadow-sm">
                  <FileText size={iconSize} className="text-primary-foreground" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-base leading-tight">Reports</div>
                  <div className="text-sm text-muted-foreground leading-tight">View & export</div>
                </div>
              </Button>
            )}
          </div>
        </>
      )}

      <CardOverlay show={showAddPPE} onClose={() => setShowAddPPE(false)}>
        <div className="mb-2 flex justify-between items-center">
          <h2 className="text-lg font-bold text-primary">Add New PPE</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowAddPPE(false)} className="h-7 w-7 p-0 rounded-full">
            ✕
          </Button>
        </div>
        <AddPPEForm onSuccess={handleAddPPESuccess} />
      </CardOverlay>
    </div>
  );
};

export default Home;
