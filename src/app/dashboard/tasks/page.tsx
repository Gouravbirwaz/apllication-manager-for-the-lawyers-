import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockTasks, mockUsers } from "@/lib/mock-data";

export default function TasksPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">My Tasks</CardTitle>
        <CardDescription>
          A list of all tasks assigned to you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTasks.map((task) => {
              const assignee = mockUsers.find(
                (user) => user.uid === task.assigned_to
              );
              let statusVariant: "default" | "secondary" | "outline" = "default";
              if (task.status === "in-progress") statusVariant = "secondary";
              if (task.status === "done") statusVariant = "outline";

              return (
                <TableRow key={task.task_id}>
                  <TableCell>
                    <Badge variant={statusVariant} className="capitalize">{task.status}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="text-muted-foreground">{task.case_title}</TableCell>
                  <TableCell>{task.due_date.toLocaleDateString()}</TableCell>
                  <TableCell>{assignee?.full_name}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
