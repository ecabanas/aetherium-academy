
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
                <TableHead>Keywords</TableHead>
                <TableHead className="w-[180px]">Last Activity</TableHead>
                <TableHead className="text-center w-[120px]">Flashcards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground mt-2">Loading sessions...</p>
                  </TableCell>
                </TableRow>
              ) : sessions.length > 0 ? (
                sessions.map((session) => (
                  <TableRow 
                    key={session.id} 
                    onClick={() => handleRowClick(session.id)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">
                      <Badge variant={session.topic === "Machine Learning" ? "default" : session.topic === "Quantum Computing" ? "secondary" : "outline"} className="whitespace-nowrap">
                        {session.topic}
                      </Badge>
                    </TableCell>
                    <TableCell>
                       <div className="max-w-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex gap-1">
                          {session.summary.split(',').map((keyword, index) => (
                            <Badge key={index} variant="outline" className="font-normal whitespace-nowrap">
                              {keyword.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TableCell>
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
