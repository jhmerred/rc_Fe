"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // 2초 후 로그인 페이지로 리다이렉트
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

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
          로그인 페이지로 이동합니다...
        </p>
      </div>
    </div>
  );
}
