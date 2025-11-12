
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CalendarDays,
  Home,
  ListTodo,
  PanelLeft,
  Search,
  Bot,
  Users,
  CreditCard,
  FileText,
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserNav } from './user-nav';
import { AshokaChakraIcon } from '../icons/ashoka-chakra-icon';
import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';

const breadcrumbLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/cases': 'All Cases',
  '/dashboard/my-clients': 'My Clients',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/hearings': 'Hearings',
  '/dashboard/ask-bot': 'Legal Bot',
  '/dashboard/payments': 'Payments',
  '/dashboard/payments/process': 'Process Payment',
  '/dashboard/invoices': 'Invoices',
};

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Dashboard', requiredRole: null },
  { href: '/dashboard/cases', icon: Briefcase, label: 'Cases', requiredRole: null },
  { href: '/dashboard/my-clients', icon: Users, label: 'My Clients', requiredRole: null },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks', requiredRole: null },
  { href: '/dashboard/hearings', icon: CalendarDays, label: 'Hearings', requiredRole: null },
  { href: '/dashboard/ask-bot', icon: Bot, label: 'Legal Bot', requiredRole: null },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments', requiredRole: 'main' },
  { href: '/dashboard/invoices', icon: FileText, label: 'Invoices', requiredRole: 'main' },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getBreadcrumb = () => {
    const pathParts = pathname.split('/').filter(p => p);
    
    if (pathParts.length === 1 && pathParts[0] === 'dashboard') {
      return <BreadcrumbPage>Dashboard</BreadcrumbPage>;
    }
    
    if (pathParts.length > 1) {
       const currentPagePath = `/${pathParts.join('/')}`;
       
       let segments: React.ReactNode[] = [];
       segments.push(
         <BreadcrumbItem key="dashboard-home">
            <BreadcrumbLink asChild>
                <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
         </BreadcrumbItem>
       );

       let currentPath = '/dashboard';
       pathParts.slice(1).forEach((part, index) => {
           currentPath += `/${part}`;
           const isLast = index === pathParts.length - 2;
           const label = breadcrumbLabels[currentPath] || part.replace(/-/g, ' ');

           if (isLast) {
                segments.push(<BreadcrumbSeparator key={`sep-${index}`} />);
                segments.push(
                    <BreadcrumbItem key={currentPath}>
                        <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                    </BreadcrumbItem>
                );
           } else {
               segments.push(<BreadcrumbSeparator key={`sep-${index}`} />);
               segments.push(
                    <BreadcrumbItem key={currentPath}>
                        <BreadcrumbLink asChild>
                            <Link href={currentPath} className="capitalize">{label}</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
               );
           }
       });

       return segments;
    }

    return <BreadcrumbPage>Dashboard</BreadcrumbPage>
  }


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="/dashboard"
              className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
            >
              <AshokaChakraIcon className="h-5 w-5 transition-all group-hover:scale-110" />
              <span className="sr-only">Nyayadeep</span>
            </Link>
            {navItems.map((item) => {
              if (item.requiredRole && user?.role !== item.requiredRole) {
                return null;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {isClient && getBreadcrumb()}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </div>
      <UserNav />
    </header>
  );
}
