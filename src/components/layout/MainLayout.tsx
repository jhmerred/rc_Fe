import { ReactNode } from "react";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  backButtonText?: string;
  showBottomButton?: boolean;
  bottomButtonContent?: ReactNode;
}

export default function PageLayout({
  title,
  children,
  showBackButton = false,
  onBackClick,
  backButtonText = "뒤로",
  showBottomButton = false,
  bottomButtonContent,
}: PageLayoutProps) {
  return (
    <div className="h-[100dvh] bg-white sm:bg-gray-50 flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-center p-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      {/* 본문 콘텐츠 */}
      <div className="flex-1 overflow-hidden pb-4">
        <div className="h-full max-w-4xl mx-auto bg-white sm:rounded-lg overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
