# Aetherium Academy 🧠✨

Aetherium Academy is a cutting-edge, AI-powered tutoring platform designed to revolutionize personalized learning. Engage with an intelligent chatbot, automatically generate flashcards from your conversations, and track your progress through an intuitive dashboard.

![Aetherium Academy Dashboard](https://placehold.co/1200x600.png)
_A screenshot of the main user dashboard._

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)

## Features

- **🤖 AI Tutor:** Engage in dynamic, interactive conversations to understand complex topics from Machine Learning to Quantum Computing.
- **🃏 AI-Generated Flashcards:** Automatically create flashcards from your chat sessions to reinforce learning and master key concepts.
- **📊 Progress Dashboard:** Visualize your learning journey with an insightful analytics dashboard tracking your review activity and topic mastery.
- **🗂️ Session History:** Revisit past conversations at any time to review concepts and refresh your memory.
- **🎨 Light & Dark Mode:** Seamlessly switch between themes for your comfort.

| AI Tutor Chat                               | Flashcard Generation                        |
| ------------------------------------------- | ------------------------------------------- |
| ![AI Tutor Chat](https://placehold.co/600x400.png) | ![Flashcard View](https://placehold.co/600x400.png) |

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **AI Integration:** [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **UI:** [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Authentication & Database:** [Firebase Auth & Firestore](https://firebase.google.com/)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- A [Firebase Project](https://console.firebase.google.com/)
- A [Google AI API Key](https://aistudio.google.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aetherium-academy.git
    cd aetherium-academy
    ```

2.  **Install NPM packages:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your Firebase and Google AI credentials. You can use the provided `.env.example` as a template.

    ```env
    # Firebase Client Configuration
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...

    # Google AI / Gemini API Key
    GOOGLE_API_KEY=...
    ```
    > **Note:** For server-side functions (like saving flashcards), you will need to set up Firebase Admin SDK credentials. See Firebase documentation for more details on setting up a service account.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

## Usage

Once the application is running, you can:
1.  **Sign up** for a new account or log in.
2.  Navigate to the **AI Tutor** to start a conversation on a chosen topic.
3.  After your session, click **"Create Flashcards"** to save key concepts.
4.  Visit the **Flashcards** page to review what you've learned.
5.  Check the **Dashboard** to see your overall progress.

## Project Structure

- `src/app/`: Contains all the pages and layouts for the Next.js App Router.
- `src/ai/`: Holds all Genkit flows for AI functionality.
- `src/components/`: Shared React components, including UI components from Shadcn.
- `src/lib/`: Utility functions and Firebase configuration files.
- `src/hooks/`: Custom React hooks.
