"use client";

import { useState } from "react";
import { Group, GroupMemberRole } from "@/features/group/types";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useGroupMembers,
  useAddGroupMember,
  useUpdateGroupMember,
  useRemoveGroupMember,
} from "@/features/group/queries";
import { useCreateEndUser } from "@/features/user/queries";
import GroupTable from "@/components/group/GroupTable";
import GroupModal from "@/components/group/GroupModal";
import DeleteConfirmModal from "@/components/group/DeleteConfirmModal";
import MemberManagementModal from "@/components/group/MemberManagementModal";
import SearchAndFilterBar from "@/components/common/SearchAndFilterBar";

export default function CompanyPage() {
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined,
  );

  // API Hooks
  const {
    data: groupsData,
    isLoading: isLoadingGroups,
    refetch,
  } = useGroups({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    is_active: filterActive,
  });

  // Member management
  const {
    data: membersData = [],
    isLoading: isLoadingMembers,
  } = useGroupMembers(selectedGroup?.id.toString() || "");

  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup(selectedGroup?.id.toString() || "");
  const deleteGroupMutation = useDeleteGroup();
  const addMemberMutation = useAddGroupMember();
  const updateMemberMutation = useUpdateGroupMember();
  const removeMemberMutation = useRemoveGroupMember();
  const createEndUserMutation = useCreateEndUser();

  // Handlers
  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setIsGroupModalOpen(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsGroupModalOpen(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteModalOpen(true);
  };

  const handleViewMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsMemberModalOpen(true);
  };

  const handleGroupSubmit = async (data: any) => {
    try {
      if (selectedGroup) {
        await updateGroupMutation.mutateAsync(data);
      } else {
        await createGroupMutation.mutateAsync(data);
      }
      setIsGroupModalOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error("Error saving group:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedGroup) {
      try {
        await deleteGroupMutation.mutateAsync(selectedGroup.id.toString());
        setIsDeleteModalOpen(false);
        setSelectedGroup(null);
      } catch (error) {
        console.error("Error deleting group:", error);
      }
    }
  };

  const handleAddMember = async (userId: number, role: GroupMemberRole) => {
    if (selectedGroup) {
      try {
        await addMemberMutation.mutateAsync({
          groupId: selectedGroup.id.toString(),
          data: { user_id: userId, role },
        });
      } catch (error) {
        console.error("Error adding member:", error);
      }
    }
  };

  const handleUpdateMember = async (
    userId: number,
    role: GroupMemberRole,
  ) => {
    if (selectedGroup) {
      try {
        await updateMemberMutation.mutateAsync({
          groupId: selectedGroup.id.toString(),
          userId: userId.toString(),
          data: { role },
        });
      } catch (error) {
        console.error("Error updating member:", error);
      }
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (selectedGroup) {
      try {
        await removeMemberMutation.mutateAsync({
          groupId: selectedGroup.id.toString(),
          userId: userId.toString(),
        });
      } catch (error) {
        console.error("Error removing member:", error);
      }
    }
  };

  const handleCreateAndAddMember = async (name: string, role: GroupMemberRole) => {
    if (selectedGroup) {
      try {
        const newUser = await createEndUserMutation.mutateAsync({
          name,
          group_id: selectedGroup.id,
        });
        
        await addMemberMutation.mutateAsync({
          groupId: selectedGroup.id.toString(),
          data: { user_id: newUser.id, role },
        });
      } catch (error) {
        console.error("Error creating and adding member:", error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const groups = groupsData?.groups || [];

  // 디버깅: 그룹 데이터 콘솔 출력
  console.log('Groups data:', groupsData);
  console.log('Groups array:', groups);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">그룹 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            조직의 그룹을 생성하고 관리할 수 있습니다.
          </p>
        </div>

        {/* Filters and Actions */}
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          searchPlaceholder="그룹 이름으로 검색..."
          filterActive={filterActive}
          onFilterActiveChange={(value) => {
            setFilterActive(value);
            setCurrentPage(1);
          }}
          createButtonText="새 그룹 만들기"
          onCreateClick={handleCreateGroup}
          createButtonIcon={
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          }
        />

        {/* Groups Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          {isLoadingGroups ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">로딩중...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                그룹이 없습니다
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                새 그룹을 만들어 시작하세요.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleCreateGroup}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  새 그룹 만들기
                </button>
              </div>
            </div>
          ) : (
            <GroupTable
              groups={groups}
              onEdit={handleEditGroup}
              onDelete={handleDeleteGroup}
              onViewMembers={handleViewMembers}
            />
          )}
        </div>

        {/* Pagination */}
        {groupsData && groupsData.total > 10 && (
          <div className="mt-6 flex justify-center">
            <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>
              {Array.from(
                { length: Math.ceil(groupsData.total / 10) },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                    currentPage === page
                      ? "z-10 border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      Math.ceil(groupsData.total / 10),
                      currentPage + 1,
                    ),
                  )
                }
                disabled={
                  currentPage === Math.ceil(groupsData.total / 10)
                }
                className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modals */}
      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => {
          setIsGroupModalOpen(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleGroupSubmit}
        group={selectedGroup}
        isLoading={
          createGroupMutation.isPending || updateGroupMutation.isPending
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="그룹 삭제"
        message={`정말로 "${selectedGroup?.name}" 그룹을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isLoading={deleteGroupMutation.isPending}
      />

      <MemberManagementModal
        isOpen={isMemberModalOpen}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        members={membersData || []}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onRemoveMember={handleRemoveMember}
        onCreateAndAddMember={handleCreateAndAddMember}
        isLoading={
          isLoadingMembers ||
          addMemberMutation.isPending ||
          updateMemberMutation.isPending ||
          removeMemberMutation.isPending ||
          createEndUserMutation.isPending
        }
      />
    </div>
  );
}
