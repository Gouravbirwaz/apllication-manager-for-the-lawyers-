
'use client';
import { useState, useEffect, useMemo } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { getColumns } from './components/columns';
import { Skeleton } from '@/components/ui/skeleton';
import type { Case, User } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { AddCaseDialog } from '@/components/cases/add-case-dialog';

// Minimal components to avoid full import during skeleton load
const Table = ({className, ...props}: React.HTMLAttributes<HTMLTableElement>) => <table className={className} {...props} />
const TableHeader = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className={className} {...props} />
const TableBody = ({className, ...props}: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className={className} {...props} />
const TableRow = ({className, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => <tr className={className} {...props} />
const TableHead = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <th className={className} {...props} />
const TableCell = ({className, ...props}: React.HTMLAttributes<HTMLTableCellElement>) => <td className={className} {...props} />

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch cases and users in parallel
      const [casesResponse, usersResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/cases`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/get/all_users`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        })
      ]);

      if (!casesResponse.ok) {
        throw new Error(`Failed to fetch cases. Status: ${casesResponse.status}`);
      }
      if (!usersResponse.ok) {
        // Non-fatal, we can still show cases without lawyer names
        console.error('Failed to fetch users');
      }

      const casesData: any[] = await casesResponse.json();
      const usersData: User[] = await usersResponse.json();
      
      const usersMap = new Map(usersData.map(user => [user.id, user]));

      // Data transformation to match frontend types and link lawyers
      const transformedCases: Case[] = casesData.map(c => ({
        ...c,
        case_id: c.id.toString(),
        title: c.case_title,
        next_hearing: c.next_hearing ? new Date(c.next_hearing) : undefined,
        filing_date: new Date(c.created_at),
        lawyer: c.advocate_id ? usersMap.get(c.advocate_id) : undefined,
      }));
      
      setCases(transformedCases);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const handleCaseAdded = (newCase: Case) => {
    // Re-fetch all cases to ensure data is fresh from the server
    fetchCases();
  };

  const handleCaseDeleted = (caseId: string) => {
    setCases(prev => prev.filter(c => c.case_id !== caseId));
  }

  const handleCaseUpdated = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.case_id === updatedCase.case_id ? updatedCase : c));
     // Re-fetch all cases to ensure data is fresh from the server, especially lawyer info
    fetchCases();
  }

  const columns = useMemo(() => getColumns(handleCaseDeleted, handleCaseUpdated), []);

  if (isLoading) {
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
                    {[...Array(6)].map((_, i) => (
                      <TableHead key={i}><Skeleton className="h-5 w-24" /></TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(10)].map((_, i) => (
                     <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
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
          <AddCaseDialog onCaseAdded={handleCaseAdded}>
            <Button size="sm" className="gap-1">
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                New Case
              </span>
            </Button>
          </AddCaseDialog>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <DataTable columns={columns} data={cases} />
        )}
      </CardContent>
    </Card>
  );
}
