import TopBar from '@/components/landing/TopBar'
import Footer from '@/components/landing/Footer'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50">
        <TopBar />
        <main className="pt-20 sm:pt-24">{children}</main>
        <Footer />
    </div>
  );
};

export default layout;