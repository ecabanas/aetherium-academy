
'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { Input } from "@/components/ui/input";
import { Loader2, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Fuse from 'fuse.js';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const fuse = useMemo(() => {
    return new Fuse(sessions, {
      keys: ['topic', 'summary'],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery) {
      return sessions;
    }
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, sessions, fuse]);

  const handleRowClick = (sessionId: string) => {
    router.push(`/tutor?sessionId=${sessionId}`);
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Session History</h1>
        <p className="text-muted-foreground">
          Search, browse, and click a session to resume your conversation.
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>All Sessions</CardTitle>
                <CardDescription>
                    A log of all your learning sessions.
                </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search by topic or keywords..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Topic</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-center">Flashcards</TableHead>
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
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
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
                       <div className="flex flex-wrap gap-1">
                          {session.summary.split(',').map((keyword, index) => (
                            <Badge key={index} variant="outline" className="font-normal whitespace-nowrap">
                              {keyword.trim()}
                            </Badge>
                          ))}
                        </div>
                    </TableCell>
                    <TableCell>{formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell className="text-center font-medium">{session.flashcardCount}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    {searchQuery ? `No sessions found for "${searchQuery}"` : "No sessions found. Start a conversation with the AI Tutor!"}
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
