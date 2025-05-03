
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddPPEForm from '@/components/forms/AddPPEForm';
import { DataTable } from '@/components/ui/data-table';
import { columns } from '@/components/equipment/columns';
import { usePPE } from '@/hooks/usePPE';
import { Skeleton } from '@/components/ui/skeleton';
import PageHeader from '@/components/common/PageHeader';

const Equipment = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { ppeItems, isLoadingPPE, ppeError, refetchPPE } = usePPE();

  if (ppeError) {
    return <div>Error: {typeof ppeError === 'boolean' ? 'Failed to load equipment data' : ppeError.toString()}</div>;
  }

  return (
    <div className="fade-in pb-28 space-y-6">
      <PageHeader title="Equipment" />
      
      <p className="text-caption">
        Manage your PPE inventory
      </p>
      
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Equipment List</CardTitle>
          <Button onClick={() => setOpen(true)}>Add Equipment</Button>
        </CardHeader>
        <CardContent>
          {isLoadingPPE ? (
            <>
              <Skeleton className="h-12 w-full rounded-md" />
              <Skeleton className="h-12 w-full rounded-md mt-2" />
              <Skeleton className="h-12 w-full rounded-md mt-2" />
              <Skeleton className="h-12 w-full rounded-md mt-2" />
            </>
          ) : (
            <DataTable columns={columns} data={ppeItems || []} />
          )}
        </CardContent>
      </Card>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <AddPPEForm onPPECreated={() => {
            setOpen(false);
            refetchPPE();
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Equipment;
