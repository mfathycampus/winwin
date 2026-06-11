import { Sidebar } from '../../components/dashboard/Sidebar';
import { TopBar } from '../../components/dashboard/TopBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar on the right for RTL */}
      <div className="fixed top-0 right-0 h-full w-64 z-40">
        <Sidebar />
      </div>

      {/* Main content offset to the left of sidebar */}
      <div className="mr-64 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
