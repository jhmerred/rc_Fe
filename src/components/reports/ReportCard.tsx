import Link from "next/link";
import { Report } from "@/types/report";

interface ReportCardProps {
  report: Report;
}

export default function ReportCard({ report }: ReportCardProps) {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-gray-300 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {report.title}
                </h3>
                {getStatusBadge(report.status)}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-500">
                {report.category && (
                  <span className="flex items-center gap-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {report.category}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <svg
                    className="h-4 w-4"
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
                  {report.date.toLocaleDateString("ko-KR")}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">
                {report.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {report.score && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                {report.score}점
              </div>
              <div className="text-xs text-gray-500">종합 점수</div>
            </div>
          )}

          <Link
            href={`/reports/${report.id}`}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg
              className="h-4 w-4"
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
            보고서 보기
          </Link>
        </div>
      </div>
    </div>
  );
}