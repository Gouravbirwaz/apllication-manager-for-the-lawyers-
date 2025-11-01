import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from './components/data-table';
import { columns } from './components/columns';
import { mockCases } from '@/lib/mock-data';

export default function CasesPage() {
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
