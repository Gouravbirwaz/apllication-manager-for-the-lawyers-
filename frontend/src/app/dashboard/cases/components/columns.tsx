
"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Case } from "@/lib/types"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { deleteCaseAction } from "@/app/actions"
import { EditCaseDialog } from "@/components/cases/edit-case-dialog"

interface CaseActionsProps {
  caseData: Case;
  onCaseDeleted: (caseId: string) => void;
  onCaseUpdated: (updatedCase: Case) => void;
}

const CaseActions = ({ caseData, onCaseDeleted, onCaseUpdated }: CaseActionsProps) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = async () => {
    const result = await deleteCaseAction(caseData.case_id);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Case deleted successfully.",
      });
      onCaseDeleted(caseData.case_id);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the case
              <span className="font-semibold"> &quot;{caseData.title}&quot; </span>
              and all of its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCaseDialog
        caseData={caseData}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onCaseUpdated={onCaseUpdated}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <Link href={`/dashboard/cases/${caseData.id}`}>
            <DropdownMenuItem>View details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(String(caseData.id))}>
            Copy case ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit case
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            Delete case
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};


export const getColumns = (
  onCaseDeleted: (caseId: string) => void,
  onCaseUpdated: (updatedCase: Case) => void
): ColumnDef<Case>[] => [
  {
    accessorKey: "case_title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Case Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Link href={`/dashboard/cases/${row.original.id}`}>
        <div className="font-medium text-primary hover:underline">{row.getValue("case_title")}</div>
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "outline" | "secondary" | "default" = status === 'closed' ? 'outline' : status === 'in-progress' ? 'secondary' : 'default';
      return <Badge variant={variant} className="capitalize">{status}</Badge>
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.getValue("client") as Case['client'];
      return <div>{client?.full_name || 'N/A'}</div>;
    },
  },
   {
    accessorKey: "lawyer",
    header: "Lead Lawyer",
    cell: ({ row }) => {
      const lawyer = row.original.lawyer;
      return <div>{lawyer?.name || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "next_hearing",
    header: "Next Hearing",
    cell: ({ row }) => {
      const dateString = row.getValue("next_hearing") as string | undefined;
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return <div>{date.toLocaleDateString()}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const caseData = row.original

      return <CaseActions caseData={caseData} onCaseDeleted={onCaseDeleted} onCaseUpdated={onCaseUpdated} />
    },
  },
]
