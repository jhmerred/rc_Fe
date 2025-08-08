export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4 text-6xl">📋</div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">
        아직 완료된 검사가 없습니다
      </h3>
      <p className="text-sm text-gray-600">
        검사를 진행하면 이곳에서 결과를 확인할 수 있습니다.
      </p>
    </div>
  );
}