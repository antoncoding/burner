'use client';

import { Toaster } from 'react-hot-toast';
import DashboardContent from './components/DashboardContent';

export default function HomePage() {
  return (
    <div className="font-zen">
      <Toaster />
      <DashboardContent />
    </div>
  );
}
