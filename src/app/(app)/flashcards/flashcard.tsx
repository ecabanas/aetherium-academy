"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type FlashcardProps = {
  question: string;
  answer: string;
  onMarkLearned: () => void;
  onMarkNeedsReview: () => void;
};

export function Flashcard({ question, answer, onMarkLearned, onMarkNeedsReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // When the card content changes, flip it back to the front.
  useEffect(() => {
    setIsFlipped(false);
  }, [question]);


  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation(); // Prevent the card from flipping when a button is clicked
    action();
  }

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
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between p-6">
          <CardContent className="flex-grow flex items-center justify-center p-0">
            <p className="text-base text-center">{answer}</p>
          </CardContent>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={(e) => handleButtonClick(e, onMarkNeedsReview)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Needs Review
            </Button>
            <Button size="sm" onClick={(e) => handleButtonClick(e, onMarkLearned)}>
              <Check className="h-4 w-4 mr-2" />
              Learned
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
