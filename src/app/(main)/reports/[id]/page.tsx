"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";
import { getReportById } from "@/data/mockReports";

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;

  const reportData = getReportById(reportId);

  if (!reportData) {
    return (
      <MainLayout title="보고서를 찾을 수 없습니다">
        <div className="text-center">
          <button
            onClick={() => router.push("/reports")}
            className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            목록으로 돌아가기
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title="보고서 상세"
      showBackButton={true}
      onBackClick={() => router.push("/reports")}
      backButtonText="목록으로"
    >
      <div className="h-full overflow-y-auto p-4 [-ms-overflow-style:'none'] [scrollbar-width:none] sm:p-8 [&::-webkit-scrollbar]:hidden">
        {/* 헤더 */}
        <div className="mb-8">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {reportData.title}
          </h2>
          <p className="mb-4 text-gray-600">{reportData.description}</p>
          <p className="text-sm text-gray-500">
            검사일: {reportData.date.toLocaleDateString("ko-KR")}
          </p>
        </div>

        {/* 요약 */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            📋 종합 평가
          </h3>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <p className="leading-relaxed text-gray-700">
              {reportData.content.summary}
            </p>
          </div>
        </div>

        {/* 강점 */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            💪 주요 강점
          </h3>
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <ul className="space-y-2">
              {reportData.content.strengths.map((strength, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 개선 영역 */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            📈 개선 영역
          </h3>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <ul className="space-y-2">
              {reportData.content.improvements.map((improvement, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-500"></span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 추천 사항 */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            🎯 추천 사항
          </h3>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <ul className="space-y-2">
              {reportData.content.recommendations.map(
                (recommendation, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <span className="mr-3 h-2 w-2 flex-shrink-0 rounded-full bg-purple-500"></span>
                    {recommendation}
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        {/* 목록으로 버튼 */}
        <Link
          href="/reports"
          className="flex w-full items-center justify-center rounded-md border border-gray-300 py-3 text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          목록으로
        </Link>
      </div>
    </MainLayout>
  );
}
