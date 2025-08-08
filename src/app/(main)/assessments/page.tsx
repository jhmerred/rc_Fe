'use client';

import { useState } from 'react';
import { 
  Assessment, 
  AssessmentStatus, 
  AssessmentSession,
  AssessmentSessionStatus 
} from '@/features/assessment/types';
import {
  useAssessments,
  useAssessmentSessions,
  useCreateAssessment,
  useUpdateAssessment,
  useDeleteAssessment,
  useStartSession,
  useUpdateSessionStatus,
  useGenerateReport,
} from '@/features/assessment/hooks';
import { useGroups } from '@/features/group/hooks';
import AssessmentTable from '@/components/assessment/AssessmentTable';
import AssessmentModal from '@/components/assessment/AssessmentModal';
import DeleteConfirmModal from '@/components/group/DeleteConfirmModal';
import SessionManagementModal from '@/components/assessment/SessionManagementModal';

export default function AssessmentsPage() {
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<AssessmentStatus | undefined>(undefined);
  const [filterGroupId, setFilterGroupId] = useState<number | undefined>(undefined);

  // API Hooks
  const { data: assessmentsData, isLoading: isLoadingAssessments, refetch } = useAssessments({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: filterStatus,
    group_id: filterGroupId,
  });

  const { data: groupsData } = useGroups({ limit: 100 });

  const { data: sessionsData, isLoading: isLoadingSessions } = useAssessmentSessions(
    selectedAssessment?.id.toString() || '',
    { assessment_id: selectedAssessment?.id }
  );

  const createAssessmentMutation = useCreateAssessment();
  const updateAssessmentMutation = useUpdateAssessment();
  const deleteAssessmentMutation = useDeleteAssessment();
  const startSessionMutation = useStartSession();
  const updateSessionStatusMutation = useUpdateSessionStatus();
  const generateReportMutation = useGenerateReport();

  // Handlers
  const handleCreateAssessment = () => {
    setSelectedAssessment(null);
    setIsAssessmentModalOpen(true);
  };

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsAssessmentModalOpen(true);
  };

  const handleDeleteAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsDeleteModalOpen(true);
  };

  const handleViewSessions = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setIsSessionModalOpen(true);
  };

  const handlePublishAssessment = async (assessment: Assessment) => {
    try {
      await updateAssessmentMutation.mutateAsync({
        id: assessment.id.toString(),
        data: { status: AssessmentStatus.PUBLISHED },
      });
    } catch (error) {
      console.error('Error publishing assessment:', error);
    }
  };

  const handleAssessmentSubmit = async (data: any) => {
    try {
      if (selectedAssessment) {
        await updateAssessmentMutation.mutateAsync({
          id: selectedAssessment.id.toString(),
          data,
        });
      } else {
        await createAssessmentMutation.mutateAsync(data);
      }
      setIsAssessmentModalOpen(false);
      setSelectedAssessment(null);
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedAssessment) {
      try {
        await deleteAssessmentMutation.mutateAsync(selectedAssessment.id.toString());
        setIsDeleteModalOpen(false);
        setSelectedAssessment(null);
      } catch (error) {
        console.error('Error deleting assessment:', error);
      }
    }
  };

  const handleStartSession = async (userId: number) => {
    if (selectedAssessment) {
      try {
        await startSessionMutation.mutateAsync({
          assessmentId: selectedAssessment.id.toString(),
          userId,
        });
      } catch (error) {
        console.error('Error starting session:', error);
      }
    }
  };

  const handleUpdateSessionStatus = async (sessionId: string, status: AssessmentSessionStatus) => {
    try {
      await updateSessionStatusMutation.mutateAsync({
        sessionId,
        status,
      });
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const handleViewSessionDetail = (session: AssessmentSession) => {
    // TODO: Implement session detail view
    console.log('View session detail:', session);
  };

  const handleGenerateReport = async (sessionId: string) => {
    try {
      await generateReportMutation.mutateAsync(sessionId);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  // Mock data for development (replace with real API data)
  const mockAssessments: Assessment[] = assessmentsData?.items || [
    {
      id: 1,
      title: '기초 성격 검사',
      description: '기본적인 성격 유형을 파악하는 검사',
      group_id: 1,
      created_by_id: 1,
      status: AssessmentStatus.PUBLISHED,
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      title: '직무 적합성 검사',
      description: '직무에 대한 적합성을 평가하는 검사',
      group_id: 2,
      created_by_id: 1,
      status: AssessmentStatus.DRAFT,
      created_at: '2024-01-15',
    },
  ];

  const groups = groupsData?.groups || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">검사 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            그룹별 검사를 생성하고 관리할 수 있습니다.
          </p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="검사 제목으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              />
              <select
                value={filterStatus || ''}
                onChange={(e) => {
                  setFilterStatus(e.target.value ? e.target.value as AssessmentStatus : undefined);
                  setCurrentPage(1);
                }}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">모든 상태</option>
                <option value={AssessmentStatus.DRAFT}>초안</option>
                <option value={AssessmentStatus.PUBLISHED}>게시됨</option>
                <option value={AssessmentStatus.IN_PROGRESS}>진행중</option>
                <option value={AssessmentStatus.COMPLETED}>완료</option>
                <option value={AssessmentStatus.ARCHIVED}>보관됨</option>
              </select>
              <select
                value={filterGroupId || ''}
                onChange={(e) => {
                  setFilterGroupId(e.target.value ? parseInt(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
              >
                <option value="">모든 그룹</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
              >
                검색
              </button>
            </form>
            <button
              onClick={handleCreateAssessment}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              새 검사 만들기
            </button>
          </div>
        </div>

        {/* Assessments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoadingAssessments ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">로딩중...</p>
            </div>
          ) : mockAssessments.length === 0 ? (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">검사가 없습니다</h3>
              <p className="mt-1 text-sm text-gray-500">새 검사를 만들어 시작하세요.</p>
              <div className="mt-6">
                <button
                  onClick={handleCreateAssessment}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  새 검사 만들기
                </button>
              </div>
            </div>
          ) : (
            <AssessmentTable
              assessments={mockAssessments}
              onEdit={handleEditAssessment}
              onDelete={handleDeleteAssessment}
              onViewSessions={handleViewSessions}
              onPublish={handlePublishAssessment}
            />
          )}
        </div>

        {/* Pagination */}
        {assessmentsData && assessmentsData.total > assessmentsData.limit && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              {Array.from({ length: Math.ceil(assessmentsData.total / assessmentsData.limit) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page
                      ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(assessmentsData.total / assessmentsData.limit), currentPage + 1))}
                disabled={currentPage === Math.ceil(assessmentsData.total / assessmentsData.limit)}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => {
          setIsAssessmentModalOpen(false);
          setSelectedAssessment(null);
        }}
        onSubmit={handleAssessmentSubmit}
        assessment={selectedAssessment}
        groups={groups}
        isLoading={createAssessmentMutation.isPending || updateAssessmentMutation.isPending}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedAssessment(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="검사 삭제"
        message={`정말로 "${selectedAssessment?.title}" 검사를 삭제하시겠습니까? 관련된 모든 세션과 결과도 함께 삭제됩니다.`}
        isLoading={deleteAssessmentMutation.isPending}
      />

      <SessionManagementModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedAssessment(null);
        }}
        assessment={selectedAssessment}
        sessions={sessionsData?.items || []}
        onStartSession={handleStartSession}
        onUpdateSessionStatus={handleUpdateSessionStatus}
        onViewSessionDetail={handleViewSessionDetail}
        onGenerateReport={handleGenerateReport}
        isLoading={
          isLoadingSessions ||
          startSessionMutation.isPending ||
          updateSessionStatusMutation.isPending ||
          generateReportMutation.isPending
        }
      />
    </div>
  );
}