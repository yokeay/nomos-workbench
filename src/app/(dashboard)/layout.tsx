import { AuthProvider } from '@/components/auth-provider'
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { TimelinePanel } from '@/components/layout/timeline-panel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-hidden bg-background">
            {children}
          </main>

          {/* Timeline Panel */}
          <TimelinePanel />
        </div>
      </div>
    </AuthProvider>
  );
}