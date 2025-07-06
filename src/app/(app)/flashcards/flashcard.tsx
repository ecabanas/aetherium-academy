"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type FlashcardProps = {
  question: string;
  answer: string;
};

export function Flashcard({ question, answer }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // When the card content changes, flip it back to the front.
  useEffect(() => {
    setIsFlipped(false);
  }, [question]);

  return (
    <div
      className="[perspective:1000px] w-full h-64 group cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          "relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]",
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        )}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] flex flex-col justify-center items-center p-6 text-center">
          <p className="text-lg font-semibold">{question}</p>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center items-center p-6 text-center">
           <p className="text-base">{answer}</p>
        </div>
      </Card>
    </div>
  );
}
