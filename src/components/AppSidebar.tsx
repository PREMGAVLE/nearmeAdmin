import {
  LayoutDashboard, Building2, Users, UserCog, CreditCard, BarChart3,
  Tags, Settings, ClipboardCheck, FolderPlus, Briefcase, TrendingUp, Building,
  MessageSquare, CalendarCheck, UsersRound, Crown
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

const menusByRole: Record<UserRole, { label: string; items: NavItem[] }[]> = {
  super_admin: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/super-admin/dashboard', icon: LayoutDashboard },
        { title: 'All Businesses', url: '/super-admin/businesses', icon: Building2 },
      ],
    },
    {
      label: 'Management',
      items: [
        { title: 'User Management', url: '/super-admin/users', icon: UsersRound },
        { title: 'Admin Management', url: '/super-admin/admins', icon: UserCog },
        { title: 'Salesman Management', url: '/super-admin/salesmen', icon: Users },
        { title: 'Categories', url: '/super-admin/categories', icon: Tags },
      ],
    },
    {
      label: 'Finance',
      items: [
        { title: 'Payments & Revenue', url: '/super-admin/payments', icon: CreditCard },
        { title: 'Premium Requests', url: '/super-admin/premium-requests', icon: Crown },
        { title: 'Reports', url: '/super-admin/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'CRM',
      items: [
        { title: 'Leads', url: '/super-admin/leads', icon: MessageSquare },
        { title: 'Bookings', url: '/super-admin/bookings', icon: CalendarCheck },
      ],
    },
    {
      label: 'System',
      items: [
        { title: 'Settings', url: '/super-admin/settings', icon: Settings },
      ],
    },
  ],
  admin: [
    {
      label: 'Overview',
      items: [
        { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'Pending Approvals', url: '/admin/approvals', icon: ClipboardCheck },
        { title: 'All Businesses', url: '/admin/businesses', icon: Building2 },
      ],
    },
    {
      label: 'Operations',
      items: [
        { title: 'Payment Verification', url: '/admin/payments', icon: CreditCard },
        { title: 'Premium Requests', url: '/admin/premium-requests', icon: Crown },
        { title: 'Categories', url: '/admin/categories', icon: Tags },
        { title: 'Reports', url: '/admin/reports', icon: BarChart3 },
      ],
    },
    {
      label: 'CRM',
      items: [
        { title: 'Leads', url: '/admin/leads', icon: MessageSquare },
        { title: 'Bookings', url: '/admin/bookings', icon: CalendarCheck },
      ],
    },
  ],
  salesman: [
    {
      label: 'My Work',
      items: [
        { title: 'Dashboard', url: '/salesman/dashboard', icon: LayoutDashboard },
        { title: 'Add Business', url: '/salesman/add-business', icon: FolderPlus },
        { title: 'My Businesses', url: '/salesman/businesses', icon: Briefcase },
        { title: 'My Performance', url: '/salesman/performance', icon: TrendingUp },
      ],
    },
  ],
  owner: [],
  user: [],
};

export function AppSidebar() {
  const { user } = useAuth();
  if (!user) return null;

  const groups = menusByRole[user.role] || [];

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Building className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold text-sidebar-foreground">SmartBurhanpur</h1>
            <p className="text-xs text-sidebar-muted">City</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-sidebar-muted text-xs uppercase tracking-widest">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
