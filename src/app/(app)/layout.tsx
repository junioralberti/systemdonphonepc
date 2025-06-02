
"use client";

import type React from 'react';
import { useState } from 'react'; // Added useState
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { navItems, type NavItem } from '@/config/nav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; // Added Dialog components
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, ChevronDown, Calculator } from 'lucide-react'; // Added Calculator icon
import Image from 'next/image';
import { CalculatorComponent } from '@/components/calculator/calculator-component'; // Added CalculatorComponent

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, userRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false); // State for calculator dialog

  if (!isAuthenticated) {
    return null; 
  }
  
  const getInitials = (name: string = "Usuário") => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const topNavItems = navItems.filter(item => !item.isBottom && (!item.role || item.role === userRole));
  const bottomNavItems = navItems.filter(item => item.isBottom && (!item.role || item.role === userRole));


  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-semibold text-primary">
            <Image 
              src="/donphone-logo.png" 
              alt="DonPhone Logo" 
              width={28} 
              height={28} 
              data-ai-hint="company logo"
            />
            <span className="font-headline">DonPhone</span>
          </Link>
        </SidebarHeader>
        <SidebarContent className="flex-grow p-2">
          <SidebarMenu>
            {topNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.title, className: "text-xs" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 border-t border-sidebar-border">
           <SidebarMenu>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.title, className: "text-xs" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton onClick={logout} tooltip={{ children: "Sair", className: "text-xs" }}>
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
           <SidebarTrigger className="md:hidden" />
           <div className="flex-1">
             {/* Breadcrumbs or page title can go here */}
           </div>
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" onClick={() => setIsCalculatorOpen(true)} aria-label="Abrir Calculadora">
                <Calculator className="h-5 w-5" />
             </Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative flex items-center gap-2 px-2 sm:px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="Avatar do Usuário" data-ai-hint="user avatar" />
                    <AvatarFallback>{getInitials(userRole === 'admin' ? "Administrador" : "Usuário Padrão")}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{userRole === 'admin' ? "Administrador" : "Usuário Padrão"}</span>
                  <ChevronDown className="h-4 w-4 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')}>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Suporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
           </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </SidebarInset>
      
      <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
        <DialogContent className="p-0 max-w-xs border-none bg-transparent shadow-none">
          {/* DialogHeader and DialogTitle are removed to make it more like a floating widget */}
          <CalculatorComponent />
        </DialogContent>
      </Dialog>

    </SidebarProvider>
  );
}
