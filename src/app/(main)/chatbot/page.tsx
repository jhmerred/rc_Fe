import ChatBot from "@/components/chatbot/ChatBot";
import MainLayout from "@/components/layout/MainLayout";

export default function ChatBotPage() {
  return (
    <MainLayout title="어디서부터 시작할까요?">
      <ChatBot />
    </MainLayout>
  );
}