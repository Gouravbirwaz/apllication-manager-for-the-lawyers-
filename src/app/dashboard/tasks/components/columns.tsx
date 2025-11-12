
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
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
import type { Task, User, Case, TaskPriority, TaskStatus } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { deleteTaskAction } from "@/app/actions"
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog"

const TaskActions = ({
    task,
    onTaskAction,
    allUsers,
    allCases,
}: {
    task: Task,
    onTaskAction: () => void,
    allUsers: User[],
    allCases: Case[]
}) => {
    const { toast } = useToast();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleDelete = async () => {
        const result = await deleteTaskAction(task.id);
        if (result.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Task deleted successfully.",
            });
            onTaskAction();
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
                            This will permanently delete the task: <strong>{task.title}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <EditTaskDialog
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                task={task}
                onTaskUpdated={onTaskAction}
                allUsers={allUsers}
                cases={allCases}
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
                    <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                    >
                        Delete Task
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}

const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
        case 'Urgent': return 'destructive';
        case 'High': return 'default';
        case 'Medium': return 'secondary';
        case 'Low': return 'outline';
        default: return 'outline';
    }
}

const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
        case 'Done': return 'outline';
        case 'In Progress': return 'secondary';
        case 'Pending': return 'default';
        default: return 'default';
    }
}

export const getColumns = (
  onTaskAction: () => void,
  allUsers: User[],
  allCases: Case[],
): ColumnDef<Task>[] => ([
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Task
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("title")}</div>,
  },
  {
    accessorKey: "case.case_title",
    header: "Case",
    cell: ({ row }) => <div>{row.original.case?.case_title || 'N/A'}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TaskStatus;
      return <Badge variant={getStatusBadgeVariant(status)} className="capitalize">{status}</Badge>
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.getValue("priority") as TaskPriority;
      return <Badge variant={getPriorityBadgeVariant(priority)} className="capitalize">{priority}</Badge>
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
        const date = row.getValue("due_date") as string;
        return <div>{new Date(date).toLocaleDateString()}</div>
    },
  },
  {
    accessorKey: "assignee.name",
    header: "Assigned To",
     cell: ({ row }) => <div>{row.original.assignee?.name || 'N/A'}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const task = row.original;
      return <TaskActions task={task} onTaskAction={onTaskAction} allUsers={allUsers} allCases={allCases} />
    },
  },
])
