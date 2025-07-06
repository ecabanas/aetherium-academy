'use client';

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/auth/auth-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Flashcard } from "./flashcard";
import { Check, RefreshCw, Loader2 } from "lucide-react";
import { getFlashcardsFromDatabase } from "./actions";

type FlashcardData = {
  question: string;
  answer: string;
};

type AllFlashcards = {
  [topic: string]: FlashcardData[];
};

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
    setCount(initialCount > 1 ? initialCount - 1 : 0); // Exclude completion card
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
    <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
      <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={index}>
              <Flashcard 
                question={card.question} 
                answer={card.answer}
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
      
      {current <= count && count > 0 && (
        <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" onClick={handleMark}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Needs Review
            </Button>
            <Button size="lg" onClick={handleMark}>
              <Check className="h-4 w-4 mr-2" />
              Learned
            </Button>
        </div>
      )}

      { count > 0 && 
        <div className="flex flex-col gap-2">
            <div className="text-center text-sm text-muted-foreground">
            Card {Math.min(current, count)} of {count}
            </div>
            <Progress value={deckProgress} className="w-full" />
        </div>
      }
    </div>
  );
};

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [allFlashcards, setAllFlashcards] = useState<AllFlashcards | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFlashcards() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const idToken = await user.getIdToken();
        const flashcards = await getFlashcardsFromDatabase(idToken);
        setAllFlashcards(flashcards);
      } catch (error) {
        console.error("Failed to fetch flashcards from database", error);
        setAllFlashcards({ "Machine Learning": [], "Quantum Computing": [], "Other": [] });
      } finally {
        setIsLoading(false);
      }
    }
    loadFlashcards();
  }, [user]);
  
  const flashcardDecks = useMemo(() => ({
    "Machine Learning": allFlashcards?.["Machine Learning"] || [],
    "Quantum Computing": allFlashcards?.["Quantum Computing"] || [],
    "Other": allFlashcards?.["Other"] || [],
  }), [allFlashcards]);

  if (isLoading) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Flashcards</h1>
                <p className="text-muted-foreground">Review your flashcards to master new concepts.</p>
            </div>
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Flashcards</h1>
        <p className="text-muted-foreground">Review your flashcards to master new concepts.</p>
      </div>
      <Tabs defaultValue="ml" className="w-full">
        <TabsList className="mx-auto grid w-full max-w-md grid-cols-3">
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
