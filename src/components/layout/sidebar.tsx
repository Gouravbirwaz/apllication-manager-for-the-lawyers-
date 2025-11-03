
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Briefcase,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  Settings,
  Bot,
  Users,
  CreditCard,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { AshokaChakraIcon } from '@/components/icons/ashoka-chakra-icon';
import { useUser } from '@/contexts/UserContext';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', requiredRole: null },
  { href: '/dashboard/cases', icon: Briefcase, label: 'Cases', requiredRole: null },
  { href: '/dashboard/my-clients', icon: Users, label: 'My Clients', requiredRole: null },
  { href: '/dashboard/tasks', icon: ListTodo, label: 'Tasks', requiredRole: null },
  { href: '/dashboard/hearings', icon: CalendarDays, label: 'Hearings', requiredRole: null },
  { href: '/dashboard/ask-bot', icon: Bot, label: 'Legal Bot', requiredRole: null },
  { href: '/dashboard/payments', icon: CreditCard, label: 'Payments', requiredRole: 'main' },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <AshokaChakraIcon className="h-5 w-5 transition-all group-hover:scale-110" />
            <span className="sr-only">Nyayadeep</span>
          </Link>

          {navItems.map((item) => {
            if (item.requiredRole && user?.role !== item.requiredRole) {
              return null;
            }
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8",
                      pathname.startsWith(item.href)
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Settings</TooltipContent>
          </Tooltip>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
