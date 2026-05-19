import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Toaster } from 'react-hot-toast';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-hero-gradient text-fitpro-text">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#004D4D',
            color: '#F8F9FA',
            border: '1px solid #E9D8A6',
          },
          success: { iconTheme: { primary: '#E9D8A6', secondary: '#004D4D' } },
        }}
      />
    </div>
  );
}
