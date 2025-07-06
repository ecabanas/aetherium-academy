'use client';

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Flashcard } from "./flashcard";

type FlashcardData = {
  question: string;
  answer: string;
};

type AllFlashcards = {
  [topic: string]: FlashcardData[];
};

const initialMlFlashcards: FlashcardData[] = [
  {
    question: "What is Linear Regression?",
    answer: "A supervised learning algorithm used for predicting a continuous dependent variable based on one or more independent variables.",
  },
  {
    question: "What is a Decision Tree?",
    answer: "A supervised learning algorithm that is used for both classification and regression tasks. It has a tree-like structure.",
  },
  {
    question: "Define 'Overfitting' in Machine Learning.",
    answer: "A modeling error that occurs when a function is too closely fit to a limited set of data points. It may therefore fail to predict future observations reliably.",
  }
];

const initialQcFlashcards: FlashcardData[] = [
    {
        question: "What is a Qubit?",
        answer: "The basic unit of quantum information, the quantum analogue of the classical bit. It can exist in a superposition of states."
    },
    {
        question: "What is Superposition?",
        answer: "A fundamental principle of quantum mechanics where a quantum system can exist in multiple states at the same time until it is measured."
    },
    {
        question: "What is Quantum Entanglement?",
        answer: "A physical phenomenon that occurs when a pair or group of particles is generated in such a way that the quantum state of each particle of the pair/group cannot be described independently of the state of the others."
    },
];

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-64 max-w-lg mx-auto">
        <h3 className="text-xl font-medium">No flashcards yet</h3>
        <p className="text-sm text-muted-foreground">
            Generate flashcards from your AI Tutor sessions.
        </p>
    </div>
);

const FlashcardDeck = ({ cards }: { cards: FlashcardData[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const initialCount = api.scrollSnapList().length;
    setCount(initialCount > 0 ? initialCount - 1 : 0); // Exclude completion card
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
    };

    api.on("select", onSelect);
    
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const handleMark = () => {
    if (api?.canScrollNext()) {
      api.scrollNext();
    }
  };

  const deckProgress = count > 0 ? (current / count) * 100 : (current > count ? 100 : 0);

  if (cards.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-4">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={index}>
              <Flashcard 
                question={card.question} 
                answer={card.answer}
                onMarkLearned={handleMark}
                onMarkNeedsReview={handleMark}
              />
            </CarouselItem>
          ))}
          <CarouselItem>
             <div className="flex flex-col items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-12 text-center h-64">
                <h3 className="text-xl font-medium">Deck Complete!</h3>
                <p className="text-sm text-muted-foreground">
                    You've reviewed all the cards in this deck.
                </p>
                <Button onClick={() => api?.scrollTo(0)} className="mt-4">Review Again</Button>
            </div>
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious className="-left-12" />
        <CarouselNext className="-right-12" />
      </Carousel>
      
      <div className="text-center text-sm text-muted-foreground">
        Card {Math.min(current, count)} of {count}
      </div>
      <Progress value={deckProgress} className="w-full" />
    </div>
  );
};


export default function FlashcardsPage() {
  const [allFlashcards, setAllFlashcards] = useState<AllFlashcards>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const storedFlashcards: AllFlashcards = JSON.parse(localStorage.getItem("user-flashcards") || "{}");
      
      const mergedFlashcards: AllFlashcards = {
        "Machine Learning": [...initialMlFlashcards],
        "Quantum Computing": [...initialQcFlashcards],
        "Other": [],
      };

      for (const topic in storedFlashcards) {
        if (Object.prototype.hasOwnProperty.call(storedFlashcards, topic)) {
          if (!mergedFlashcards[topic]) {
            mergedFlashcards[topic] = [];
          }
          const existingQuestions = new Set(mergedFlashcards[topic].map(fc => fc.question));
          const newUniqueCards = storedFlashcards[topic].filter(storedCard => !existingQuestions.has(storedCard.question));
          mergedFlashcards[topic].push(...newUniqueCards);
        }
      }
      setAllFlashcards(mergedFlashcards);

    } catch (error) {
      console.error("Failed to parse flashcards from localStorage", error);
       setAllFlashcards({
        "Machine Learning": initialMlFlashcards,
        "Quantum Computing": initialQcFlashcards,
        "Other": [],
      });
    } finally {
      setIsMounted(true);
    }
  }, []);
  
  const flashcardDecks = useMemo(() => ({
    "Machine Learning": allFlashcards["Machine Learning"] || [],
    "Quantum Computing": allFlashcards["Quantum Computing"] || [],
    "Other": allFlashcards["Other"] || [],
  }), [allFlashcards]);

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Flashcards</h1>
        <p className="text-muted-foreground">Review your flashcards to master new concepts.</p>
      </div>
      <Tabs defaultValue="ml" className="w-full">
        <TabsList className="mx-auto">
          <TabsTrigger value="ml">Machine Learning ({flashcardDecks["Machine Learning"].length})</TabsTrigger>
          <TabsTrigger value="qc">Quantum Computing ({flashcardDecks["Quantum Computing"].length})</TabsTrigger>
          <TabsTrigger value="other">Other ({flashcardDecks["Other"].length})</TabsTrigger>
        </TabsList>
        <TabsContent value="ml" className="mt-6">
          <FlashcardDeck cards={flashcardDecks["Machine Learning"]} />
        </TabsContent>
        <TabsContent value="qc" className="mt-6">
          <FlashcardDeck cards={flashcardDecks["Quantum Computing"]} />
        </TabsContent>
        <TabsContent value="other" className="mt-6">
          <FlashcardDeck cards={flashcardDecks["Other"]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
