'use client';

import { AddPageDialog } from "@/components/add-page-dialog";
import { DashboardContent } from '@/components/dashboard-content';
import { Suspense, useCallback, useState } from 'react';


export default function Dashboard() {
  const [key, setKey] = useState(0); 

  const handleSuccess = useCallback(() => {
    setKey(prev => prev + 1);
  }, []);

  return (
    <div className="container py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Monitor and manage your tracked pages
            </p>
          </div>
          <AddPageDialog onSuccess={handleSuccess} />
        </div>
        <Suspense>
        <DashboardContent key={key} />
        </Suspense>
      </div>
    </div>
  );
}