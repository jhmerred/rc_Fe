"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Message } from "@/types/chatbot";
import MessageBubble from "@/components/chatbot/MessageBubble";
import InputForm from "@/components/chatbot/InputForm";

export default function ChatBot() {
  const [responseIndex, setResponseIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 미리 준비된 assistant 응답들
  const assistantResponses = useMemo(
    () => [
      "안녕하세요! 저는 리얼 코칭 AI 어시스턴트입니다. 어떻게 도와드릴까요?",
      "좋은 질문이네요! 제가 도와드릴 수 있는 부분은 다음과 같습니다:\n\n1. 개인 발전을 위한 코칭\n2. 목표 설정 및 달성 전략\n3. 시간 관리 및 생산성 향상\n4. 커리어 개발 조언\n\n어떤 부분에 관심이 있으신가요?",
      "목표를 설정하는 것은 성공의 첫걸음입니다! SMART 목표 설정법을 아시나요?\n\n• Specific (구체적)\n• Measurable (측정 가능)\n• Achievable (달성 가능)\n• Relevant (관련성)\n• Time-bound (기한 설정)\n\n이 원칙을 활용해보시는 것은 어떨까요?",
      "시간 관리에 대해 말씀드리자면, 포모도로 기법을 추천드립니다:\n\n• 25분 집중 작업\n• 5분 휴식\n• 4회 반복 후 15-30분 긴 휴식\n\n이 방법으로 집중력과 생산성을 높일 수 있습니다.",
      "스트레스 관리는 정말 중요합니다. 다음과 같은 방법들을 시도해보세요:\n\n1. 규칙적인 운동\n2. 명상이나 심호흡\n3. 충분한 수면\n4. 취미 활동\n5. 사회적 관계 유지\n\n어떤 방법이 가장 도움이 될 것 같나요?",
      "커리어 개발을 위해서는 지속적인 학습이 중요합니다. 다음을 고려해보세요:\n\n• 업계 트렌드 파악\n• 네트워킹 확대\n• 새로운 기술 습득\n• 멘토 찾기\n• 정기적인 자기 평가\n\n현재 어떤 분야에서 성장하고 싶으신가요?",
      "동기부여를 유지하는 팁:\n\n1. 작은 성취를 축하하기\n2. 진척 상황 기록하기\n3. 긍정적인 환경 만들기\n4. 롤모델 찾기\n5. 실패를 학습 기회로 보기\n\n오늘 작은 목표부터 시작해보는 것은 어떨까요?",
      '워라밸(일과 삶의 균형)을 위한 조언:\n\n• 명확한 경계 설정\n• 우선순위 정하기\n• "아니오"라고 말하는 법 배우기\n• 자기 돌봄 시간 확보\n• 업무 외 활동 계획하기\n\n현재 가장 어려운 부분은 무엇인가요?',
      "좋은 하루 보내세요! 더 궁금한 점이 있으면 언제든 물어보세요. 당신의 성장과 발전을 응원합니다! 💪",
    ],
    [],
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: assistantResponses[0],
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(true);

    // 1초 후 다음 응답 표시
    setTimeout(() => {
      const nextIndex = (responseIndex + 1) % assistantResponses.length;
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantResponses[nextIndex],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
      setResponseIndex(nextIndex);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 메시지 영역 - 스크롤 가능 */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && (
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-none">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 - 하단 고정 */}
      <div className="flex-shrink-0">
        <InputForm
          onSendMessage={handleSendMessage}
          placeholder="메시지를 입력하세요..."
        />
      </div>
    </div>
  );
}
