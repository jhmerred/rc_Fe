import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/common/AuthGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthGuard>
  );
}
