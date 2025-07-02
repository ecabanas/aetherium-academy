'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { GraduationCap, BrainCircuit, Target, History } from "lucide-react";
import Link from "next/link";

const chartData = [
  { date: "Mon", learned: 12 },
  { date: "Tue", learned: 15 },
  { date: "Wed", learned: 8 },
  { date: "Thu", learned: 20 },
  { date: "Fri", learned: 14 },
  { date: "Sat", learned: 22 },
  { date: "Sun", learned: 18 },
];

const chartConfig = {
  learned: {
    label: "Learned",
    color: "hsl(var(--primary))",
  },
};

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome Back!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your learning journey.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flashcards Reviewed</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topics Mastered</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Machine Learning, Quantum Computing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Answer Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.5%</div>
            <p className="text-xs text-muted-foreground">+3.2% from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Session Time</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18h 42m</div>
            <p className="text-xs text-muted-foreground">Across 12 sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">Weekly Review Activity</CardTitle>
            <CardDescription>Number of flashcards marked as learned this week.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="learned" fill="var(--color-learned)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">Learning Paths</CardTitle>
            <CardDescription>Continue your learning journey.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-4">
                <BrainCircuit className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium leading-none">Machine Learning</p>
                  <p className="text-sm text-muted-foreground">Core concepts and algorithms</p>
                </div>
              </div>
              <Button asChild variant="outline"><Link href="/tutor">Continue</Link></Button>
            </div>
            <div className="flex items-center justify-between space-x-4">
               <div className="flex items-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                <div>
                  <p className="text-sm font-medium leading-none">Quantum Computing</p>
                  <p className="text-sm text-muted-foreground">Superposition and entanglement</p>
                </div>
              </div>
              <Button asChild variant="outline"><Link href="/tutor">Start</Link></Button>
            </div>
             <div className="flex items-center justify-between space-x-4">
               <div className="flex items-center space-x-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm font-medium leading-none">General Topics</p>
                  <p className="text-sm text-muted-foreground">Explore any subject</p>
                </div>
              </div>
              <Button asChild variant="outline"><Link href="/tutor">Explore</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
