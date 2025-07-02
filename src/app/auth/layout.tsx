import Link from "next/link";
import { BrainCircuit } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container relative grid h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://placehold.co/1200x900.png)",
            }}
            data-ai-hint="technology abstract"
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            <Link href="/" className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6" />
              <span className="font-headline text-xl">Aetherium Academy</span>
            </Link>
          </div>
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                &ldquo;The future of learning is here. Personalized, adaptive, and intelligent.&rdquo;
              </p>
              <footer className="text-sm">Aetherium Team</footer>
            </blockquote>
          </div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
