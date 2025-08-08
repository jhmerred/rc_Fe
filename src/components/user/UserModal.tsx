"use client";

import { useState, useEffect } from "react";
import {
  User,
  UserRole,
  CreateHRRequest,
  CreateEndUserRequest,
  UpdateUserRequest,
} from "@/features/user/types";
import { useGroups } from "@/features/group/queries";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    data: CreateHRRequest | CreateEndUserRequest | UpdateUserRequest,
  ) => void;
  user?: User | null;
  isLoading?: boolean;
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  isLoading = false,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: UserRole.ENDUSER,
    is_active: true,
    group_id: undefined as number | undefined,
  });

  const { data: groupsData } = useGroups({ limit: 100 });
  const groups = groupsData?.groups || [];

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role,
        is_active: user.is_active,
        group_id: undefined,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        role: UserRole.ENDUSER,
        is_active: true,
        group_id: undefined,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 새 사용자 생성시 그룹 필수
    if (!user && !formData.group_id) {
      newErrors.group_id = "그룹을 선택해주세요.";
    }

    // 역할에 따른 필수 필드 검증
    if (formData.role === UserRole.HR || formData.role === UserRole.ADMIN) {
      if (!formData.email.trim()) {
        newErrors.email = "이메일을 입력해주세요.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "올바른 이메일 형식을 입력해주세요.";
      }
    }

    if (formData.role === UserRole.ENDUSER) {
      if (!formData.name.trim()) {
        newErrors.name = "이름을 입력해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="relative top-20 mx-auto w-11/12 rounded-md border bg-white p-5 shadow-lg md:w-2/3 lg:w-1/2 xl:w-2/5">
        <div className="mt-3">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {user ? "사용자 수정" : "새 사용자 추가"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            {!user && (
              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  역할 *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    handleChange("role", e.target.value as UserRole)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={UserRole.HR}>HR</option>
                  <option value={UserRole.ENDUSER}>일반 사용자</option>
                  <option value={UserRole.ADMIN}>관리자</option>
                </select>
              </div>
            )}

            {/* Group Selection - 새 사용자만 */}
            {!user && (
              <div>
                <label
                  htmlFor="group_id"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  그룹 *
                </label>
                <select
                  id="group_id"
                  value={formData.group_id || ""}
                  onChange={(e) =>
                    handleChange(
                      "group_id",
                      e.target.value ? parseInt(e.target.value) : undefined,
                    )
                  }
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                    errors.group_id
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                >
                  <option value="">그룹을 선택하세요</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.group_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.group_id}</p>
                )}
              </div>
            )}

            {/* Name - ENDUSER나 기존 사용자 수정 시 */}
            {(formData.role === UserRole.ENDUSER || user) && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  이름 {formData.role === UserRole.ENDUSER ? "*" : ""}
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="사용자 이름을 입력하세요"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email - HR, ADMIN이나 기존 사용자 수정 시 */}
            {(formData.role !== UserRole.ENDUSER || user) && (
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  이메일{" "}
                  {formData.role === UserRole.HR ||
                  formData.role === UserRole.ADMIN
                    ? "*"
                    : ""}
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-1 ${
                    errors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  }`}
                  placeholder="user@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            )}

            {/* Role - 기존 사용자 수정 시만 */}
            {user && (
              <div>
                <label
                  htmlFor="role"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  역할 *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    handleChange("role", e.target.value as UserRole)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={UserRole.ADMIN}>관리자</option>
                  <option value={UserRole.HR}>HR</option>
                  <option value={UserRole.ENDUSER}>일반 사용자</option>
                </select>
              </div>
            )}

            {/* Status - 기존 사용자 수정 시만 */}
            {user && (
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      handleChange("is_active", e.target.checked)
                    }
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">활성 상태</span>
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                disabled={isLoading}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    저장중...
                  </div>
                ) : user ? (
                  "수정"
                ) : (
                  "생성"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
