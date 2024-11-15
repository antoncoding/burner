'use client';

import Header from '@/components/layout/header/Header';
import { Toaster } from 'react-hot-toast';
import DashboardContent from './components/DashboardContent';

export default function HomePage() {
  return (
    <div className="font-zen">
      <Header />
      <Toaster />
      <DashboardContent />
    </div>
  );
}
