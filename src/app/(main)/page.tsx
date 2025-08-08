"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/queries";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // 역할별 기본 페이지로 리다이렉트
      const defaultRoutes = {
        ENDUSER: "/dashboard",
        HR: "/dashboard",
        ADMIN: "/dashboard",
      };

      const redirectPath = defaultRoutes[user.role];
      if (redirectPath) {
        router.replace(redirectPath);
      }
    }
  }, [user, isLoading, router]);

  // 로딩 중이거나 리다이렉트 처리 중
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  );
}
