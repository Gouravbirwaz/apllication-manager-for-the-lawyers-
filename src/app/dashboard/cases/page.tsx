'use client';
import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { mockCases } from '@/lib/mock-data';
import { Skeleton } from '@/components/ui/skeleton';

export default function CasesPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
       <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center py-4">
             <Skeleton className="h-10 w-64" />
          </div>
          <div className="rounded-md border">
             <Table>
                <TableHeader>
                  <TableRow>
                    {[...Array(5)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, i) => (
                     <TableRow key={i}>
                        {[...Array(5)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-20" /></TableCell>
                        ))}
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-headline text-2xl">Cases</CardTitle>
            <CardDescription>Manage your legal cases.</CardDescription>
          </div>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              New Case
            </span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={mockCases} />
      </CardContent>
    </Card>
  );
}

// Minimal components to avoid full import during skeleton load
const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => <table className={className} {...props} />
const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={className} {...props} />
const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={className} {...props} />
const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={className} {...props} />
const TableHead = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <th className={className} {...props} />
const TableCell = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <td className={className} {...props} />
