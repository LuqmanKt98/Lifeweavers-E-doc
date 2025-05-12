
// src/components/layout/AppSidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Client } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Home, Users, Settings, ChevronLeft, ChevronRight, PlusCircle, Bell, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/Logo'; // Import the new Logo component

interface AppSidebarProps {
  clients: Client[];
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function AppSidebar({ clients, isOpen, toggleSidebar }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/messages', label: 'Messages', icon: MessageSquare },
    // Add more static nav items if needed
  ];

  if (user?.role === 'Super Admin' || user?.role === 'Admin') {
    // Ensure User Management is not duplicated if already there
    if (!navItems.find(item => item.href === '/admin/users')) {
      navItems.push({ href: '/admin/users', label: 'User Management', icon: Settings });
    }
  }
  
  const commonLinkClasses = "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors";
  const activeLinkClasses = "bg-primary/10 text-primary";
  const inactiveLinkClasses = "hover:bg-accent hover:text-accent-foreground text-muted-foreground";
  const iconClasses = "mr-3 h-5 w-5";
  const labelClasses = "truncate";


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:w-16"
        )}
      >
        <div className={cn("flex items-center border-b border-sidebar-border px-4", isOpen ? "h-16 justify-between" : "h-16 justify-center")}>
          <Link href="/dashboard" className={cn("flex items-center gap-2 group", !isOpen && "justify-center")}>
             <Logo className={cn("h-8 w-auto transition-all duration-300", isOpen ? "max-w-full" : "max-w-[2rem]")} iconOnly={!isOpen} />
          </Link>
          {isOpen && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
        </div>

        <ScrollArea className="flex-1">
          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  commonLinkClasses,
                  pathname === item.href ? activeLinkClasses : inactiveLinkClasses,
                  !isOpen && "justify-center"
                )}
                title={isOpen ? "" : item.label}
              >
                <item.icon className={cn(iconClasses, !isOpen && "mr-0")} />
                {isOpen && <span className={labelClasses}>{item.label}</span>}
              </Link>
            ))}

            <div className={cn("px-3 pt-4 pb-2", !isOpen && "px-0 text-center")}>
              <h3 className={cn("text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70", !isOpen && "hidden")}>
                Clients
              </h3>
               {!isOpen && <Users className="mx-auto h-5 w-5 text-sidebar-foreground/70" />}
            </div>
            
            {user && (user.role === 'Admin' || user.role === 'Super Admin') && isOpen && (
                <Button variant="outline" className="w-full justify-start mb-2 bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary">
                  <PlusCircle className={cn(iconClasses, !isOpen && "mr-0")} />
                  {isOpen && <span className={labelClasses}>Add New Client</span>}
                </Button>
              )}

            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className={cn(
                  commonLinkClasses,
                  pathname === `/clients/${client.id}` ? activeLinkClasses : inactiveLinkClasses,
                  !isOpen && "justify-center"
                )}
                title={isOpen ? "" : client.name}
              >
                <Users className={cn(iconClasses, !isOpen && "mr-0")} />
                {isOpen && <span className={labelClasses}>{client.name}</span>}
              </Link>
            ))}
          </nav>
        </ScrollArea>
        
        <div className="mt-auto border-t border-sidebar-border p-3">
           <Button variant="ghost" onClick={toggleSidebar} className={cn("w-full justify-start", !isOpen && "justify-center")}>
            {isOpen ? <ChevronLeft className={iconClasses} /> : <ChevronRight className={iconClasses} />}
            {isOpen && <span className={labelClasses}>{isOpen ? 'Collapse' : 'Expand'}</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
