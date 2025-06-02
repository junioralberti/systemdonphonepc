import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  UserCog,
  Wrench,
  ShoppingCart,
  BarChart3,
  BrainCircuit, // Or Sparkles
  LogOut,
  Settings,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  role?: 'admin' | 'user'; // Optional role for visibility
  isBottom?: boolean; // To position items like Logout and Settings at the bottom
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    title: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    title: 'Providers',
    href: '/providers',
    icon: Truck,
  },
  {
    title: 'Users',
    href: '/users',
    icon: UserCog,
    role: 'admin', // Only visible to admins
  },
  {
    title: 'Service Orders',
    href: '/service-orders',
    icon: Wrench,
  },
  {
    title: 'Counter Sales',
    href: '/counter-sales',
    icon: ShoppingCart,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    title: 'AI Diagnostics',
    href: '/ai-diagnostics',
    icon: BrainCircuit,
  },
  // Items to be placed at the bottom
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    isBottom: true,
  },
];
