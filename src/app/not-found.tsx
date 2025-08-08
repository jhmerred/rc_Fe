"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/queries";

export default function NotFound() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 로딩이 끝났을 때
    if (!isLoading) {
      if (user) {
        // 로그인된 경우: 역할별 기본 페이지로 리다이렉트
        const defaultRoutes = {
          ENDUSER: "/dashboard",
          HR: "/dashboard",
          ADMIN: "/dashboard",
        };

        const redirectPath = defaultRoutes[user.role];
        if (redirectPath) {
          // 1초 후 리다이렉트 (사용자가 404 메시지를 볼 수 있도록)
          setTimeout(() => {
            router.replace(redirectPath);
          }, 1000);
        }
      } else {
        // 로그인 안 된 경우: 로그인 페이지로
        setTimeout(() => {
          router.replace("/login");
        }, 1000);
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <p className="mt-4 text-2xl font-semibold text-gray-800">
          페이지를 찾을 수 없습니다
        </p>
        <p className="mt-2 text-gray-600">
          요청하신 페이지가 존재하지 않습니다.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          {user
            ? "메인 페이지로 이동합니다..."
            : "로그인 페이지로 이동합니다..."}
        </p>
      </div>
    </div>
  );
}
