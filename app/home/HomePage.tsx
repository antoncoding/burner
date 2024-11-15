'use client';

import Header from '@/components/layout/header/Header';
import HomeContent from './components/HomeContent';
import { Toaster } from 'react-hot-toast';

export default function HomePage() {
  return (
    <div className="font-zen">
      <Header />
      <Toaster />
      <HomeContent />
    </div>
  );
}
