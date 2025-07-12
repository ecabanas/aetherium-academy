
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/auth-provider';
import { getSessionsFromDatabase, type SessionData } from './actions';
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
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const idToken = await user.getIdToken();
        const userSessions = await getSessionsFromDatabase(idToken);
        setSessions(userSessions);
      } catch (error) {
        console.error("Failed to fetch sessions from database", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadSessions();
  }, [user]);

  const handleRowClick = (sessionId: string) => {
    router.push(`/tutor?sessionId=${sessionId}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Session History</h1>
          <p className="text-muted-foreground">Review your past conversations with the AI Tutor.</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Session History</h1>
        <p className="text-muted-foreground">
          Click a session to view the transcript or resume the conversation.
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
                <TableHead className="w-[150px]">Topic</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead className="w-[180px]">Last Activity</TableHead>
                <TableHead className="text-center w-[120px]">Flashcards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow 
                    key={session.id} 
                    onClick={() => handleRowClick(session.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <Badge variant={session.topic === "Machine Learning" ? "default" : session.topic === "Quantum Computing" ? "secondary" : "outline"}>
                        {session.topic}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{session.summary}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-center font-medium">{session.flashcardCount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No sessions found. Start a conversation with the AI Tutor!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
