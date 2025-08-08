'use client';

import { useEffect, useState } from 'react';
import { Assessment, AssessmentStatus, CreateAssessmentRequest, UpdateAssessmentRequest, Group } from '@/features/assessment/types';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAssessmentRequest | UpdateAssessmentRequest) => void;
  assessment?: Assessment | null;
  groups?: Group[];
  isLoading?: boolean;
}

export default function AssessmentModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  assessment, 
  groups = [],
  isLoading 
}: AssessmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    group_id: 0,
    status: AssessmentStatus.DRAFT,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    if (assessment) {
      setFormData({
        title: assessment.title,
        description: assessment.description || '',
        group_id: assessment.group_id,
        status: assessment.status,
        start_date: assessment.start_date ? assessment.start_date.split('T')[0] : '',
        end_date: assessment.end_date ? assessment.end_date.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        group_id: groups[0]?.id || 0,
        status: AssessmentStatus.DRAFT,
        start_date: '',
        end_date: '',
      });
    }
  }, [assessment, groups]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = {
      ...formData,
      group_id: parseInt(formData.group_id.toString()),
    };
    
    // Remove group_id for update requests
    if (assessment) {
      delete submitData.group_id;
    }
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {assessment ? '검사 수정' : '새 검사 만들기'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      검사 제목 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      placeholder="검사 제목을 입력하세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      설명
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      placeholder="검사 설명을 입력하세요"
                    />
                  </div>

                  {!assessment && (
                    <div>
                      <label htmlFor="group_id" className="block text-sm font-medium text-gray-700">
                        그룹 선택 *
                      </label>
                      <select
                        id="group_id"
                        required
                        value={formData.group_id}
                        onChange={(e) => setFormData({ ...formData, group_id: parseInt(e.target.value) })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      >
                        <option value="">그룹을 선택하세요</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      상태
                    </label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as AssessmentStatus })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value={AssessmentStatus.DRAFT}>초안</option>
                      <option value={AssessmentStatus.PUBLISHED}>게시됨</option>
                      <option value={AssessmentStatus.IN_PROGRESS}>진행중</option>
                      <option value={AssessmentStatus.COMPLETED}>완료</option>
                      <option value={AssessmentStatus.ARCHIVED}>보관됨</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                        시작일
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                        종료일
                      </label>
                      <input
                        type="date"
                        id="end_date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isLoading || (!assessment && !formData.group_id)}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리중...' : (assessment ? '수정' : '생성')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}