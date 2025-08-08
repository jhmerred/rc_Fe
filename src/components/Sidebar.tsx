"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { menuItemsByRole } from "@/constants/navigation";
import { roleColors, roleLabels } from "@/types/user";
import { useAuth } from "@/features/auth/queries";
import { useLogout } from "@/features/auth/queries";

// TODO 관리자 페이지에서도 쓸 수 있게 리팩토링
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const logoutMenuRef = useRef<HTMLDivElement>(null);

  // 실제 사용자 데이터 가져오기
  const { user, isLoading } = useAuth();
  const logout = useLogout();

  // 로딩 중이거나 사용자가 없으면 기본 메뉴 표시
  const menuItems = user ? menuItemsByRole[user.role] : [];

  // 초기 로드 시 모든 드롭다운 메뉴를 열어둠
  useEffect(() => {
    const itemsWithChildren = menuItems
      .filter((item) => item.children && item.children.length > 0)
      .map((item) => item.name);
    setExpandedMenus(new Set(itemsWithChildren));
  }, [user]);

  const toggleDropdown = (itemName: string) => {
    setExpandedMenus((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutMenuRef.current &&
        !logoutMenuRef.current.contains(event.target as Node)
      ) {
        setShowLogout(false);
      }
    };

    if (showLogout) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showLogout]);

  return (
    <>
      {/* Mobile toggle button - Menu */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-2 top-2 z-50 p-2 lg:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-dvh transition-transform lg:relative lg:h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="pb-safe relative flex h-full w-72 flex-col border-r border-gray-200 bg-white p-4">
          {/* Logo/Title and Mobile close button */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">리얼 코칭 로고</h2>
            {/* Mobile x button */}
            <button onClick={() => setIsOpen(false)} className="p-2 lg:hidden">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

          {/* Navigation */}
          <nav className="flex-1">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.children &&
                  item.children.some((child) => pathname === child.href));
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedMenus.has(item.name);

              return (
                <div key={item.href}>
                  {hasChildren ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors ${
                          isActive ? "bg-gray-100" : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {item.icon}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <svg
                          className={`h-4 w-4 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 rounded-lg px-4 py-2 transition-colors ${
                                  isChildActive
                                    ? "bg-gray-200"
                                    : "hover:bg-gray-100"
                                }`}
                              >
                                {child.icon}
                                <span>{child.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors ${
                        isActive ? "bg-gray-100" : "hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>

          {/* User Info Section */}
          <div
            className="relative mt-auto border-t border-gray-200 pt-4"
            ref={logoutMenuRef}
          >
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="w-full rounded-lg p-2 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-300">
                  {user?.picture ? (
                    <img
                      src={user.picture}
                      alt="프로필 이미지"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-white">
                      {user?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-900">
                    {user?.name || "사용자"}
                  </div>
                  {user && user.role !== "ENDUSER" && (
                    <div className="truncate text-xs text-gray-500">
                      {user.email}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  {user && (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                        roleColors[user.role].bg
                      } ${roleColors[user.role].text} mr-2`}
                    >
                      {roleLabels[user.role]}
                    </span>
                  )}
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      showLogout ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </button>

            {showLogout && (
              <div className="absolute bottom-full left-0 right-0 mb-1">
                <div className="rounded-lg border border-gray-200 bg-white p-1">
                  <button
                    onClick={() => {
                      setShowLogout(false);
                      logout.mutate();
                    }}
                    disabled={logout.isPending}
                    className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>
                      {logout.isPending ? "로그아웃 중..." : "로그아웃"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
