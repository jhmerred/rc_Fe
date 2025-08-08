"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Test {
  id: string;
  name: string;
  description: string;
  duration: string;
  category: string;
  status: "available" | "in_progress" | "completed";
}

const mockTests: Test[] = [
  {
    id: "1",
    name: "성격 유형 검사",
    description: "개인의 성격 특성과 행동 패턴을 분석하는 검사입니다.",
    duration: "약 20분",
    category: "성격",
    status: "available",
  },
  {
    id: "2",
    name: "직무 적합도 검사",
    description: "직무에 대한 적성과 역량을 평가하는 검사입니다.",
    duration: "약 30분",
    category: "직무",
    status: "available",
  },
  {
    id: "3",
    name: "리더십 역량 검사",
    description: "리더십 스타일과 역량을 진단하는 검사입니다.",
    duration: "약 25분",
    category: "리더십",
    status: "in_progress",
  },
  {
    id: "4",
    name: "스트레스 관리 검사",
    description: "스트레스 수준과 대처 능력을 측정하는 검사입니다.",
    duration: "약 15분",
    category: "건강",
    status: "completed",
  },
  {
    id: "5",
    name: "팀워크 역량 검사",
    description: "팀 내에서의 협업 능력과 소통 스타일을 평가하는 검사입니다.",
    duration: "약 20분",
    category: "협업",
    status: "available",
  },
];

export default function TestListPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "성격", "직무", "리더십", "건강", "협업"];

  const filteredTests = mockTests.filter((test) => {
    if (selectedCategory === "all") return true;
    return test.category === selectedCategory;
  });

  const handleStartTest = (testId: string) => {
    // 챗봇 페이지로 이동하면서 테스트 ID 전달
    router.push(`/chatbot?testId=${testId}`);
  };

  const getStatusBadge = (status: Test["status"]) => {
    switch (status) {
      case "available":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            시작 가능
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
            진행 중
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
            완료
          </span>
        );
    }
  };

  const getButtonText = (status: Test["status"]) => {
    switch (status) {
      case "available":
        return "검사하기";
      case "in_progress":
        return "계속하기";
      case "completed":
        return "결과보기";
    }
  };

  const handleButtonClick = (test: Test) => {
    switch (test.status) {
      case "available":
      case "in_progress":
        handleStartTest(test.id);
        break;
      case "completed":
        router.push("/reports");
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">검사 목록</h1>
          <p className="mt-2 text-gray-600">
            진행 가능한 검사를 선택하여 시작하세요.
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {category === "all" ? "전체" : category}
            </button>
          ))}
        </div>

        {/* 검사 목록 그리드 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{test.category}</p>
                  </div>
                  {getStatusBadge(test.status)}
                </div>

                <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                  {test.description}
                </p>

                <div className="mb-4 flex items-center text-sm text-gray-500">
                  <svg
                    className="mr-1.5 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {test.duration}
                </div>

                <button
                  onClick={() => handleButtonClick(test)}
                  className={`w-full rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    test.status === "completed"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : test.status === "in_progress"
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {getButtonText(test.status)}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* 빈 상태 */}
        {filteredTests.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-600">
              해당 카테고리에 검사가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}