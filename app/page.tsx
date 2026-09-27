import { ChatContainer } from "@/features/chat/components/ChatContainer";

export default function Home() {
  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-background text-foreground sm:bg-manga-dots sm:p-4 lg:p-8">
      <ChatContainer />
    </main>
  );
}
