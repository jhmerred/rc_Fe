"use client";

import { useState } from "react";
import { User, UserRole, UserFilterParams } from "@/features/user/types";
import {
  useUsers,
  useCreateHR,
  useCreateEndUser,
  useUpdateUser,
  useDeleteUser,
  useCurrentUser,
} from "@/features/user/queries";
import UserTable from "@/components/user/UserTable";
import UserModal from "@/components/user/UserModal";
import DeleteConfirmModal from "@/components/group/DeleteConfirmModal";
import SearchAndFilterBar from "@/components/common/SearchAndFilterBar";
import TabNavigation from "@/components/common/TabNavigation";

export default function UsersPage() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.ADMIN);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined,
  );

  // API Hooks
  const { data: currentUser } = useCurrentUser();

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    refetch,
  } = useUsers({
    skip: (currentPage - 1) * 10,
    limit: 10,
    role: activeTab,
    is_active: filterActive,
  });

  const createHRMutation = useCreateHR();
  const createEndUserMutation = useCreateEndUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  // Handlers
  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUserSubmit = async (data: any) => {
    console.log("Current user:", currentUser);
    console.log("Submitting data:", data);

    try {
      if (selectedUser) {
        await updateUserMutation.mutateAsync({
          id: selectedUser.id.toString(),
          data,
        });
      } else {
        // 역할에 따라 다른 API 호출
        if (data.role === UserRole.HR) {
          await createHRMutation.mutateAsync({
            email: data.email,
            group_id: data.group_id,
          });
        } else if (data.role === UserRole.ENDUSER) {
          await createEndUserMutation.mutateAsync({
            name: data.name,
            group_id: data.group_id,
          });
        }
      }
      setIsUserModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteUserMutation.mutateAsync(selectedUser.id.toString());
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    refetch();
  };

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setCurrentPage(1);
  };

  const userTabs = [
    { id: 'admin', label: '총 관리자', value: UserRole.ADMIN },
    { id: 'hr', label: '인사 관리자', value: UserRole.HR },
    { id: 'enduser', label: '일반 사용자', value: UserRole.ENDUSER }
  ];

  const users = usersData?.users || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            역할별로 사용자를 관리할 수 있습니다.
          </p>
        </div>

        {/* Filters and Actions */}
        <SearchAndFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearch}
          searchPlaceholder="이름 또는 이메일로 검색..."
          filterActive={filterActive}
          onFilterActiveChange={(value) => {
            setFilterActive(value);
            setCurrentPage(1);
          }}
          createButtonText="새 사용자 추가"
          onCreateClick={handleCreateUser}
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

        {/* Tabs */}
        <TabNavigation
          tabs={userTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Users Table */}
        <div className="overflow-hidden rounded-b-lg bg-white shadow">
          {isLoadingUsers ? (
            <div className="p-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">로딩중...</p>
            </div>
          ) : users.length === 0 ? (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                사용자가 없습니다
              </h3>
            </div>
          ) : (
            <UserTable
              users={users}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
          )}
        </div>

        {/* Pagination */}
        {usersData && usersData.total > usersData.limit && (
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
                { length: Math.ceil(usersData.total / usersData.limit) },
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
                      Math.ceil(usersData.total / usersData.limit),
                      currentPage + 1,
                    ),
                  )
                }
                disabled={
                  currentPage === Math.ceil(usersData.total / usersData.limit)
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
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUserSubmit}
        user={selectedUser}
        isLoading={
          createHRMutation.isPending ||
          createEndUserMutation.isPending ||
          updateUserMutation.isPending
        }
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="사용자 삭제"
        message={`정말로 "${selectedUser?.name}" 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
