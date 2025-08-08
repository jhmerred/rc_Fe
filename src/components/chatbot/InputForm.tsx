"use client";

import React, { useState, FormEvent, KeyboardEvent } from "react";

interface InputFormProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
}

export default function InputForm({
  onSendMessage,
  placeholder,
}: InputFormProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isComposing) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposing) {
      e.preventDefault();
      const formEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      e.currentTarget.form?.dispatchEvent(formEvent);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-transparent px-4 sm:pb-4">
      <div className="scrollbar-hide relative flex items-center">
        <textarea
          id="chat-input"
          name="message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          rows={1}
          className="scrollbar-hide w-full resize-none overflow-y-auto rounded-2xl border border-gray-200 bg-white py-3 pl-4 pr-12 text-gray-900 placeholder-gray-400 focus:border-gray-200 focus:outline-none"
          style={{
            minHeight: "100px",
            maxHeight: "200px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 transform rounded-full bg-black p-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
