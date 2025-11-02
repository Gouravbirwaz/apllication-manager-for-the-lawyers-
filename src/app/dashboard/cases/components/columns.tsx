
"use client"

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
import type { Case } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import Link from "next/link"

export const columns: ColumnDef<Case>[] = [
  {
    accessorKey: "title",
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
      <Link href={`/dashboard/cases/${row.original.case_id}`}>
        <div className="font-medium text-primary hover:underline">{row.getValue("title")}</div>
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
    accessorKey: "case_type",
    header: "Type",
    cell: ({ row }) => <div className="capitalize">{row.getValue("case_type")}</div>
  },
  {
    accessorKey: "client_id",
    header: "Client",
    cell: ({ row }) => {
      // This is using mock data. In a real app, you'd fetch this.
      const client = mockUsers.find(u => u.uid === row.getValue("client_id"));
      return <div>{client?.full_name || 'N/A'}</div>;
    },
  },
  {
    accessorKey: "next_hearing",
    header: "Next Hearing",
    cell: ({ row }) => {
      const date = row.getValue("next_hearing") as Date | undefined;
      return <div>{date ? date.toLocaleDateString() : 'N/A'}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const caseData = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <Link href={`/dashboard/cases/${caseData.case_id}`}>
                <DropdownMenuItem>View details</DropdownMenuItem>
            </Link>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(caseData.case_id)}
            >
              Copy case ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Edit case</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete case</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
