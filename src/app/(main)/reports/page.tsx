import ReportList from "@/components/reports/ReportList";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">검사 결과</h1>
          <p className="mt-2 text-gray-600">
            완료된 검사 결과를 확인하고 상세 보고서를 열람하세요.
          </p>
        </div>
        
        <ReportList />
      </div>
    </div>
  );
}
