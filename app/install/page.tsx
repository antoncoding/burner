'use client';

import InstallPWA from './components/InstallButton';

export default function DashboardPage() {
  return (
    <main className="container mx-auto flex flex-col items-center px-8 pt-16">
      <InstallPWA />
    </main>
  );
}
