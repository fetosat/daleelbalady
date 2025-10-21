import React from 'react';
import MedicalNavbar from '@/components/navigation/MedicalNavbar';

interface MedicalLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

const MedicalLayout: React.FC<MedicalLayoutProps> = ({
  children,
  showNavbar = true,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-sky-50/30 dark:from-stone-900 dark:via-stone-900 dark:to-stone-800 ${className}`}>
      {showNavbar && <MedicalNavbar />}
      
      {/* Content with proper spacing for navbar */}
      <main className={`${showNavbar ? 'pt-20' : ''} pb-6 px-6`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MedicalLayout;
