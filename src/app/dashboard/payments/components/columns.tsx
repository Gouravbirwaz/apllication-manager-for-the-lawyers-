
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import type { AdvocatePayment, User } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { deletePaymentAction } from "@/app/actions"
import { EditPaymentDialog } from "@/components/payments/edit-payment-dialog"

const PayAction = ({ payment }: { payment: AdvocatePayment }) => {
    const router = useRouter();
    const handlePay = () => {
        const params = new URLSearchParams({
            paymentIds: payment.id,
            amount: String(payment.total),
        });
        router.push(`/dashboard/payments/process?${params.toString()}`);
    }
    return <DropdownMenuItem onClick={handlePay} disabled={payment.status === 'paid'}>Pay Now</DropdownMenuItem>
}

const PaymentActions = ({
    payment,
    onPaymentDeleted,
    onPaymentUpdated,
    advocates
}: {
    payment: AdvocatePayment,
    onPaymentDeleted: () => void,
    onPaymentUpdated: () => void,
    advocates: User[]
}) => {
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleDelete = async () => {
        const result = await deletePaymentAction(payment.id);
        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Payment record deleted successfully.",
            });
            onPaymentDeleted();
        }
        setIsDeleteDialogOpen(false);
    };

    return (
        <>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the payment record for <strong>{payment.name}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <EditPaymentDialog 
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              payment={payment}
              advocates={advocates}
              onPaymentUpdated={() => {
                onPaymentUpdated();
                setIsEditDialogOpen(false);
              }}
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
                    <PayAction payment={payment} />
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}


export const getColumns = (
  onPaymentUpdated: () => void,
  onPaymentDeleted: () => void,
  advocates: User[]
): ColumnDef<AdvocatePayment>[] => ([
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Advocate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant: "outline" | "default" = status === 'paid' ? 'outline' : 'default';
      return <Badge variant={variant} className="capitalize">{status}</Badge>
    },
  },
  {
    accessorKey: "cases",
    header: () => <div className="text-right">Cases</div>,
    cell: ({ row }) => {
        const casesCount = row.getValue("cases") as number;
        return <div className="text-right font-medium">{casesCount}</div>
    },
  },
   {
    accessorKey: "billable_hours",
    header: () => <div className="text-right">Billable Hours</div>,
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("billable_hours"))
        return <div className="text-right font-medium">{amount}h</div>
    },
  },
  {
    accessorKey: "total",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <PaymentActions 
          payment={payment}
          onPaymentDeleted={onPaymentDeleted}
          onPaymentUpdated={onPaymentUpdated}
          advocates={advocates}
        />
      )
    },
  },
])
