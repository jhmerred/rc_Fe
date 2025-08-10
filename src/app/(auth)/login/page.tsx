"use client";

import { useState } from "react";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { API_BASE_URL } from "@/config";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    
    // returnUrl을 포함한 OAuth URL 생성
    const oauthUrl = `${API_BASE_URL}/auth/google`;
    
    // 백엔드 OAuth 페이지로 이동
    window.location.href = oauthUrl;
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-white">
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg px-4 py-8 sm:px-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">리얼 코칭</h1>
            <p className="mt-2 text-sm text-gray-600">
              AI 코칭으로 더 나은 나를 만나보세요
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-6 text-center text-xl font-semibold text-gray-900">
                로그인
              </h2>
            </div>

            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            />
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              로그인하면{" "}
              <a href="#" className="underline">
                서비스 이용약관
              </a>{" "}
              및{" "}
              <a href="#" className="underline">
                개인정보 처리방침
              </a>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
