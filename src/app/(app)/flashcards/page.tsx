import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flashcard } from "./flashcard";

const mlFlashcards = [
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

const qcFlashcards = [
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

export default function FlashcardsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Flashcards</h1>
        <p className="text-muted-foreground">Review your flashcards to master new concepts.</p>
      </div>
      <Tabs defaultValue="ml">
        <TabsList>
          <TabsTrigger value="ml">Machine Learning</TabsTrigger>
          <TabsTrigger value="qc">Quantum Computing</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>
        <TabsContent value="ml" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mlFlashcards.map((card, index) => (
              <Flashcard key={index} question={card.question} answer={card.answer} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="qc" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {qcFlashcards.map((card, index) => (
              <Flashcard key={index} question={card.question} answer={card.answer} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="other" className="mt-6">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center h-64">
            <h3 className="text-xl font-medium">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground">
              Generate flashcards from your AI Tutor sessions.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
