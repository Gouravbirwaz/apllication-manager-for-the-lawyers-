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
import { mockHearings } from "@/lib/mock-data";

export default function HearingsPage() {
  const sortedHearings = [...mockHearings].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Hearing Schedule</CardTitle>
        <CardDescription>
          A log of all upcoming and past hearings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Courtroom</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedHearings.map((hearing) => {
              const isUpcoming = hearing.date > new Date();
              return(
                <TableRow key={hearing.hearing_id}>
                  <TableCell className="font-medium">{hearing.date.toLocaleDateString()}</TableCell>
                  <TableCell>{hearing.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</TableCell>
                  <TableCell className="text-muted-foreground">{hearing.case_title}</TableCell>
                  <TableCell>{hearing.court_room}</TableCell>
                  <TableCell>
                    <Badge variant={isUpcoming ? "default" : "outline"}>
                      {isUpcoming ? "Upcoming" : "Concluded"}
                    </Badge>
                  </TableCell>
                </TableRow>
            )})}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
