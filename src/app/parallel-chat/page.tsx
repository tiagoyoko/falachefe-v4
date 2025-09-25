import { ParallelConversations } from "@/components/chat/parallel-conversations";

export default function ParallelChatPage() {
  // Por enquanto, usando um userId fixo para demonstração
  // Em produção, isso viria da autenticação
  const userId = "demo-user-id";

  return (
    <div className="min-h-screen bg-background">
      <ParallelConversations userId={userId} />
    </div>
  );
}
