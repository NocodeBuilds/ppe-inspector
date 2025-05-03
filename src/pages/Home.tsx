import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AddPPEForm } from '@/components/forms/AddPPEForm';

const Home = () => {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome, {profile?.full_name || 'User'}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Add New Equipment</h2>
            <p className="text-sm text-muted-foreground">Quickly add new PPE to the inventory.</p>
            <Button onClick={() => setOpen(true)} className="mt-4">Add Equipment</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">View Expiring Equipment</h2>
            <p className="text-sm text-muted-foreground">See a list of equipment nearing its expiration date.</p>
            <Button onClick={() => window.location.href = '/expiring'} className="mt-4">View Expiring</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-2">Upcoming Inspections</h2>
            <p className="text-sm text-muted-foreground">Check the schedule for upcoming equipment inspections.</p>
            <Button onClick={() => window.location.href = '/upcoming'} className="mt-4">View Inspections</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <AddPPEForm onPPECreated={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Home;
