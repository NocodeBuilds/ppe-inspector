
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, ClipboardList } from 'lucide-react';

const Inspections = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Inspections</h1>
            <p className="text-muted-foreground">Track and manage PPE inspections</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>

        <div className="text-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No inspections yet</h3>
          <p className="text-muted-foreground mb-4">
            Start by creating your first inspection
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Inspection
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Inspections;
