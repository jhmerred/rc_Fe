'use client';

import { useState } from 'react';
import { Assessment, AssessmentSession, AssessmentSessionStatus } from '@/features/assessment/types';

interface SessionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  sessions: AssessmentSession[];
  onStartSession: (userId: number) => void;
  onUpdateSessionStatus: (sessionId: string, status: AssessmentSessionStatus) => void;
  onViewSessionDetail: (session: AssessmentSession) => void;
  onGenerateReport: (sessionId: string) => void;
  isLoading?: boolean;
}

export default function SessionManagementModal({
  isOpen,
  onClose,
  assessment,
  sessions,
  onStartSession,
  onUpdateSessionStatus,
  onViewSessionDetail,
  onGenerateReport,
  isLoading
}: SessionManagementModalProps) {
  const [newSessionUserId, setNewSessionUserId] = useState('');

  if (!isOpen || !assessment) return null;

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSessionUserId) {
      onStartSession(parseInt(newSessionUserId));
      setNewSessionUserId('');
    }
  };

  const getStatusBadgeColor = (status: AssessmentSessionStatus) => {
    switch (status) {
      case AssessmentSessionStatus.NOT_STARTED:
        return 'bg-gray-100 text-gray-800';
      case AssessmentSessionStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case AssessmentSessionStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case AssessmentSessionStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case AssessmentSessionStatus.EXPIRED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: AssessmentSessionStatus) => {
    switch (status) {
      case AssessmentSessionStatus.NOT_STARTED:
        return '시작 전';
      case AssessmentSessionStatus.IN_PROGRESS:
        return '진행중';
      case AssessmentSessionStatus.PAUSED:
        return '일시정지';
      case AssessmentSessionStatus.COMPLETED:
        return '완료';
      case AssessmentSessionStatus.EXPIRED:
        return '만료';
      default:
        return status;
    }
  };

  const formatDateTime = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ko-KR');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {assessment.title} - 세션 관리
            </h3>

            {/* Start New Session Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">새 세션 시작</h4>
              <form onSubmit={handleStartSession} className="flex gap-2">
                <input
                  type="number"
                  placeholder="사용자 ID"
                  value={newSessionUserId}
                  onChange={(e) => setNewSessionUserId(e.target.value)}
                  className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                />
                <button
                  type="submit"
                  disabled={isLoading || !newSessionUserId}
                  className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  세션 시작
                </button>
              </form>
            </div>

            {/* Sessions List */}
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      시작 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      완료 시간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      채팅 수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      리포트
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {session.user?.name || `User ${session.user_id}`}
                        <span className="text-gray-500 text-xs ml-2">
                          ({session.user?.email || `ID: ${session.user_id}`})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={session.status}
                          onChange={(e) => onUpdateSessionStatus(session.id.toString(), e.target.value as AssessmentSessionStatus)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 ${getStatusBadgeColor(session.status)} border-0 focus:ring-2 focus:ring-indigo-500`}
                          disabled={isLoading}
                        >
                          <option value={AssessmentSessionStatus.NOT_STARTED}>시작 전</option>
                          <option value={AssessmentSessionStatus.IN_PROGRESS}>진행중</option>
                          <option value={AssessmentSessionStatus.PAUSED}>일시정지</option>
                          <option value={AssessmentSessionStatus.COMPLETED}>완료</option>
                          <option value={AssessmentSessionStatus.EXPIRED}>만료</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(session.started_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(session.completed_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.chats?.length || 0}개
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {session.result?.report_generated ? (
                          <span className="text-green-600">생성됨</span>
                        ) : (
                          <span className="text-gray-400">미생성</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => onViewSessionDetail(session)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세
                        </button>
                        {session.status === AssessmentSessionStatus.COMPLETED && !session.result?.report_generated && (
                          <button
                            onClick={() => onGenerateReport(session.id.toString())}
                            disabled={isLoading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            리포트 생성
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                        세션이 없습니다
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}