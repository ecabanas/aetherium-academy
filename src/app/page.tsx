import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, GraduationCap, History, Lightbulb } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-headline text-2xl font-bold">
          <BrainCircuit className="h-8 w-8 text-primary" />
          <span>Aetherium Academy</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/sign-in">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="py-20 md:py-32">
          <div className="container mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-4">
              Learn Anything, Master It with AI
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Aetherium Academy is a cutting-edge, AI-powered tutoring chatbot that revolutionizes personalized learning.
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">Start Your Learning Journey</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-headline text-3xl font-bold text-center mb-12">Why Aetherium Academy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">AI Tutoring</CardTitle>
                </CardHeader>
                <CardContent>
                  Engage in interactive conversations to understand complex topics from Machine Learning to Quantum Computing.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">AI Flashcards</CardTitle>
                </CardHeader>
                <CardContent>
                  Automatically generate flashcards from your chat sessions to reinforce learning and master key concepts.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-primary"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20V16"/></svg>
                  <CardTitle className="font-headline">Track Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  Visualize your learning journey with an insightful analytics dashboard tracking your progress and performance.
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <History className="w-8 h-8 text-primary" />
                  <CardTitle className="font-headline">Session History</CardTitle>
                </CardHeader>
                <CardContent>
                  Revisit past conversations at any time to review concepts and refresh your memory.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-background border-t">
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} Aetherium Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
