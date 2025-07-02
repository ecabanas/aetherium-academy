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

const sessions = [
    { id: "1", topic: "Machine Learning", date: "2024-07-21", length: "15 min" },
    { id: "2", topic: "Quantum Computing", date: "2024-07-20", length: "25 min" },
    { id: "3", topic: "Machine Learning", date: "2024-07-18", length: "5 min" },
    { id: "4", topic: "General Topics", date: "2024-07-15", length: "30 min" },
];

export default function HistoryPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Session History</h1>
        <p className="text-muted-foreground">
          Review your past conversations with the AI Tutor.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Sessions</CardTitle>
          <CardDescription>
            A log of all your learning sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">
                    <Badge variant={session.topic === "Machine Learning" ? "default" : session.topic === "Quantum Computing" ? "secondary" : "outline"}>{session.topic}</Badge>
                  </TableCell>
                  <TableCell>{session.date}</TableCell>
                  <TableCell>{session.length}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
