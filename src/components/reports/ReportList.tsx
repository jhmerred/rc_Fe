"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mockReports } from "@/data/mockReports";
import { Report } from "@/types/report";

export default function ReportList() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");

  const categories = ["all", "리더십", "조직", "성과", "소통", "건강", "협업"];

  const filteredReports = mockReports
    .filter((report) => {
      if (selectedCategory === "all") return true;
      return report.category === selectedCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return b.date.getTime() - a.date.getTime();
      } else {
        return (b.score || 0) - (a.score || 0);
      }
    });

  const getStatusBadge = (status?: Report["status"]) => {
    if (!status) return null;

    const statusConfig = {
      excellent: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "우수",
      },
      good: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "양호",
      },
      average: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "보통",
      },
      needs_improvement: {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "개선 필요",
      },
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "";
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/${reportId}`);
  };

  return (
    <div>
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

      {/* 검사 결과 그리드 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{report.category}</p>
                </div>
                {getStatusBadge(report.status)}
              </div>

              <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                {report.description}
              </p>

              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {report.date.toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                {report.score && (
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(report.score)}`}>
                      {report.score}점
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleViewReport(report.id)}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                보고서 보기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 빈 상태 */}
      {filteredReports.length === 0 && (
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
            해당 카테고리에 완료된 검사 결과가 없습니다.
          </p>
        </div>
      )}
    </div>
  );
}