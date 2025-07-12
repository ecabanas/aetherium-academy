
import { Suspense } from 'react';
import { TutorClient } from "./tutor-client";
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export default function TutorPage() {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <Suspense fallback={<LoadingFallback />}>
        <TutorClient />
      </Suspense>
    </div>
  );
}
