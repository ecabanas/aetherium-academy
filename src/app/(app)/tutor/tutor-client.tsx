"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Bot, BrainCircuit, GraduationCap, Send, Sparkles, User as UserIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { aiTutorChatbot } from "@/ai/flows/ai-tutor";
import { generateFlashcards } from "@/ai/flows/generate-flashcards";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "model";
  content: string;
};

export function TutorClient() {
  const [topic, setTopic] = useState("Machine Learning");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    startTransition(async () => {
      try {
        const chatHistory = messages.map(m => ({ role: m.role as 'user' | 'model', content: m.content }));
        const response = await aiTutorChatbot({ topic, question: input, chatHistory });
        const assistantMessage: Message = { role: "model", content: response.answer };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to get a response from the AI tutor.",
          variant: "destructive",
        });
        setMessages((prev) => prev.slice(0, -1)); // remove optimistic user message
      }
    });
  };

  const handleGenerateFlashcards = () => {
    const conversation = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    if (conversation.length === 0) {
      toast({
        title: "Cannot generate flashcards",
        description: "The conversation is empty.",
      });
      return;
    }

    setIsGenerating(async () => {
      try {
        toast({
          title: "Generating Flashcards",
          description: "The AI is creating flashcards from your conversation...",
        });
        const newFlashcards = await generateFlashcards({ chatConversation: conversation });
        
        if (newFlashcards && newFlashcards.length > 0) {
          const existingFlashcards = JSON.parse(localStorage.getItem('user-flashcards') || '{}');
          const topicFlashcards = existingFlashcards[topic] || [];
          
          const existingQuestions = new Set(topicFlashcards.map((fc: any) => fc.question));
          const newUniqueCards = newFlashcards.filter(fc => !existingQuestions.has(fc.question));

          if(newUniqueCards.length > 0) {
            existingFlashcards[topic] = [...topicFlashcards, ...newUniqueCards];
            localStorage.setItem('user-flashcards', JSON.stringify(existingFlashcards));
          }
      }

        toast({
          title: "Success!",
          description: "Flashcards generated. Click here to view them.",
          className: "cursor-pointer",
          onClick: () => router.push('/flashcards'),
        });
      } catch (error) {
         toast({
          title: "Error",
          description: "Failed to generate flashcards.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle className="font-headline">AI Tutor</CardTitle>
          <Select defaultValue="Machine Learning" onValueChange={(newTopic) => { setTopic(newTopic); setMessages([]) }}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Machine Learning">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" /> Machine Learning
                </div>
              </SelectItem>
              <SelectItem value="Quantum Computing">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  Quantum Computing
                </div>
              </SelectItem>
              <SelectItem value="Other">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> Other
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerateFlashcards} disabled={isGenerating || messages.length === 0}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isGenerating ? 'Generating...' : 'Create Flashcards'}
        </Button>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center gap-2">
                    <Bot size={48} />
                    <p>Start the conversation by asking a question about {topic}.</p>
                </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "model" && (
                  <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`rounded-lg p-3 max-w-xl ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                    {message.role === 'model' ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-base font-semibold my-1" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-outside ml-5 my-2 space-y-1" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-5 my-2 space-y-1" {...props} />,
                                li: ({node, ...props}) => <li className="" {...props} />,
                                a: ({node, ...props}) => <a className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-muted-foreground/50 pl-4 italic my-2" {...props} />,
                                code: ({node, inline, className, children, ...props}) => {
                                  return !inline ? (
                                    <pre className="bg-background rounded-md p-3 my-2 font-mono text-sm overflow-x-auto">
                                      <code {...props}>{children}</code>
                                    </pre>
                                  ) : (
                                    <code className="bg-background rounded px-1.5 py-1 font-mono text-sm" {...props}>
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                        >{message.content}</ReactMarkdown>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                </div>
                {message.role === "user" && (
                  <Avatar>
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isPending && (
                <div className="flex gap-3 justify-start">
                    <Avatar>
                        <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg p-3 max-w-xl bg-muted">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-0"></span>
                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-150"></span>
                            <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-300"></span>
                        </div>
                    </div>
                </div>
             )}
          </div>
        </ScrollArea>
        <div className="flex items-start gap-4 pt-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask a question about ${topic}...`}
            className="flex-grow resize-none"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isPending}
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
