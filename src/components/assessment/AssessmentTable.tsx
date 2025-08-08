'use client';

import { Assessment, AssessmentStatus } from '@/features/assessment/types';

interface AssessmentTableProps {
  assessments: Assessment[];
  onEdit: (assessment: Assessment) => void;
  onDelete: (assessment: Assessment) => void;
  onViewSessions: (assessment: Assessment) => void;
  onPublish: (assessment: Assessment) => void;
}

export default function AssessmentTable({ 
  assessments, 
  onEdit, 
  onDelete, 
  onViewSessions,
  onPublish
}: AssessmentTableProps) {
  const getStatusBadgeColor = (status: AssessmentStatus) => {
    switch (status) {
      case AssessmentStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case AssessmentStatus.PUBLISHED:
        return 'bg-green-100 text-green-800';
      case AssessmentStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case AssessmentStatus.COMPLETED:
        return 'bg-purple-100 text-purple-800';
      case AssessmentStatus.ARCHIVED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: AssessmentStatus) => {
    switch (status) {
      case AssessmentStatus.DRAFT:
        return '초안';
      case AssessmentStatus.PUBLISHED:
        return '게시됨';
      case AssessmentStatus.IN_PROGRESS:
        return '진행중';
      case AssessmentStatus.COMPLETED:
        return '완료';
      case AssessmentStatus.ARCHIVED:
        return '보관됨';
      default:
        return status;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              제목
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              설명
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              그룹
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              시작일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              종료일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              세션 수
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {assessments.map((assessment) => (
            <tr key={assessment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {assessment.id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {assessment.title}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {assessment.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {assessment.group?.name || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(assessment.status)}`}>
                  {getStatusText(assessment.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(assessment.start_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(assessment.end_date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {assessment.sessions?.length || 0}개
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button
                  onClick={() => onViewSessions(assessment)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  세션
                </button>
                {assessment.status === AssessmentStatus.DRAFT && (
                  <button
                    onClick={() => onPublish(assessment)}
                    className="text-green-600 hover:text-green-900"
                  >
                    게시
                  </button>
                )}
                <button
                  onClick={() => onEdit(assessment)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(assessment)}
                  className="text-red-600 hover:text-red-900"
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}