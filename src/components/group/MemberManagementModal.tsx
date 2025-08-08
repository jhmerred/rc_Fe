'use client';

import { useState } from 'react';
import { Group, GroupMember, GroupMemberRole } from '@/features/group/types';
import { useUsers } from '@/features/user/queries';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  members: GroupMember[];
  onAddMember: (userId: number, role: GroupMemberRole) => void;
  onUpdateMember: (userId: number, role: GroupMemberRole) => void;
  onRemoveMember: (userId: number) => void;
  onCreateAndAddMember: (name: string, role: GroupMemberRole) => void;
  isLoading?: boolean;
}

export default function MemberManagementModal({
  isOpen,
  onClose,
  group,
  members,
  onAddMember,
  onUpdateMember,
  onRemoveMember,
  onCreateAndAddMember,
  isLoading
}: MemberManagementModalProps) {
  const [memberMode, setMemberMode] = useState<'existing' | 'new'>('new');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [memberRole, setMemberRole] = useState<GroupMemberRole>(GroupMemberRole.MEMBER);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const { data: usersData } = useUsers({
    limit: 50,
    role: undefined,
    is_active: true
  });

  if (!isOpen || !group) return null;

  const handleAddExistingMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      onAddMember(parseInt(selectedUserId), memberRole);
      setSelectedUserId('');
      setMemberRole(GroupMemberRole.MEMBER);
    }
  };

  const handleCreateNewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      onCreateAndAddMember(newMemberName.trim(), memberRole);
      setNewMemberName('');
      setMemberRole(GroupMemberRole.MEMBER);
    }
  };

  const availableUsers = usersData?.users?.filter(user => {
    const isAlreadyMember = members.some(member => member.user_id === user.id);
    const matchesSearch = userSearchTerm ? 
      user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
      : true;
    return !isAlreadyMember && matchesSearch;
  }) || [];

  const getRoleBadgeColor = (role: GroupMemberRole) => {
    switch (role) {
      case GroupMemberRole.OWNER:
        return 'bg-purple-100 text-purple-800';
      case GroupMemberRole.ADMIN:
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {group.name} - 멤버 관리
            </h3>

            {/* Add Member Form */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">멤버 추가</h4>
              
              {/* Tab Navigation */}
              <div className="flex mb-4 border-b border-gray-200">
                <button
                  type="button"
                  onClick={() => setMemberMode('new')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    memberMode === 'new'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  새 사용자 생성
                </button>
                <button
                  type="button"
                  onClick={() => setMemberMode('existing')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    memberMode === 'existing'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  기존 사용자 추가
                </button>
              </div>

              {/* New Member Creation Form */}
              {memberMode === 'new' && (
                <form onSubmit={handleCreateNewMember} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="사용자 이름 입력"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                      required
                    />
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as GroupMemberRole)}
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value={GroupMemberRole.MEMBER}>멤버</option>
                      <option value={GroupMemberRole.ADMIN}>관리자</option>
                      <option value={GroupMemberRole.OWNER}>소유자</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isLoading || !newMemberName.trim()}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      생성 및 추가
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    새로운 사용자를 생성하고 바로 이 그룹에 추가합니다.
                  </p>
                </form>
              )}

              {/* Existing Member Addition Form */}
              {memberMode === 'existing' && (
                <form onSubmit={handleAddExistingMember} className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="사용자 검색..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border mb-2"
                      />
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        required
                      >
                        <option value="">사용자 선택...</option>
                        {availableUsers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value as GroupMemberRole)}
                      className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                    >
                      <option value={GroupMemberRole.MEMBER}>멤버</option>
                      <option value={GroupMemberRole.ADMIN}>관리자</option>
                      <option value={GroupMemberRole.OWNER}>소유자</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedUserId}
                      className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      추가
                    </button>
                  </div>
                  {availableUsers.length === 0 && userSearchTerm && (
                    <p className="text-xs text-gray-500">
                      검색 결과가 없습니다.
                    </p>
                  )}
                  {availableUsers.length === 0 && !userSearchTerm && (
                    <p className="text-xs text-gray-500">
                      추가 가능한 사용자가 없습니다.
                    </p>
                  )}
                </form>
              )}
            </div>

            {/* Members List */}
            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      역할
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.user?.name || `User ${member.user_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={member.role}
                          onChange={(e) => onUpdateMember(member.user_id, e.target.value as GroupMemberRole)}
                          className={`text-xs font-semibold rounded-full px-2 py-1 ${getRoleBadgeColor(member.role)} border-0 focus:ring-2 focus:ring-indigo-500`}
                          disabled={isLoading}
                        >
                          <option value={GroupMemberRole.MEMBER}>멤버</option>
                          <option value={GroupMemberRole.ADMIN}>관리자</option>
                          <option value={GroupMemberRole.OWNER}>소유자</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => onRemoveMember(member.user_id)}
                          disabled={isLoading}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          제거
                        </button>
                      </td>
                    </tr>
                  ))}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        멤버가 없습니다
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