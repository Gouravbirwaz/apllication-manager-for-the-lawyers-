'use client';

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

const breadcrumbLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/cases': 'All Cases',
  '/dashboard/my-clients': 'My Clients',
  '/dashboard/tasks': 'Tasks',
  '/dashboard/hearings': 'Hearings',
  '/dashboard/ask-bot': 'Legal Bot',
  '/dashboard/payments': 'Payments',
};

export function AppHeader() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

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
       if(pathParts[1] === 'cases' && pathParts.length > 2) {
          return <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/cases">All Cases</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Case Details</BreadcrumbPage>
            </BreadcrumbItem>
          </>;
       }
       
       const pageName = breadcrumbLabels[currentPagePath] || pathParts[pathParts.length - 1].replace(/-/g, ' ');
       return <>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="capitalize">{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </>;
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
            <Link
              href="/dashboard"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Home className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/dashboard/cases"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Briefcase className="h-5 w-5" />
              Cases
            </Link>
             <Link
              href="/dashboard/my-clients"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Users className="h-5 w-5" />
              My Clients
            </Link>
            <Link
              href="/dashboard/tasks"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <ListTodo className="h-5 w-5" />
              Tasks
            </Link>
            <Link
              href="/dashboard/hearings"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="h-5 w-5" />
              Hearings
            </Link>
            <Link
              href="/dashboard/ask-bot"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <Bot className="h-5 w-5" />
              Legal Bot
            </Link>
            <Link
              href="/dashboard/payments"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            >
              <CreditCard className="h-5 w-5" />
              Payments
            </Link>
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
