import { Outlet } from 'react-router-dom';
import { useAuth, getRoleLabel } from '@/contexts/AuthContext';
import { AppSidebar } from '@/components/AppSidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden bg-background">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Layout */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-border bg-card/90 backdrop-blur-md px-3 sm:px-4 md:px-6 shrink-0 overflow-hidden">
            {/* Left */}
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              <SidebarTrigger />

              <div className="min-w-0 overflow-hidden">
                <h2 className="text-[11px] sm:text-base font-semibold text-foreground truncate">
                  {user.name}
                </h2>

                <Badge
                  variant="secondary"
                  className="mt-0.5 text-[10px] sm:text-xs max-w-full truncate"
                >
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 shrink-0"
              >
                <Bell className="h-5 w-5 text-muted-foreground" />

                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                  3
                </span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive gap-2 px-2 sm:px-3 shrink-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 sm:p-4 md:p-6 lg:p-8">
            <div className="w-full max-w-full overflow-x-hidden">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}