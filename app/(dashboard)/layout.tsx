import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NotificationBell from "@/components/shared/notification-bell";
import { SessionProvider } from "@/components/session-provider";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">MarketingOS</h1>
            <p className="text-sm text-gray-500 mt-1">AI Marketing Platform</p>
          </div>

          <nav className="mt-8 space-y-1 px-4">
            <SidebarLink href="/dashboard" label="Dashboard" icon="📊" />
            <SidebarLink href="/dashboard/social" label="Social Media" icon="📱" />
            <SidebarLink
              href="/dashboard/performance"
              label="Performance"
              icon="📈"
            />
            <SidebarLink href="/dashboard/seo" label="SEO" icon="🔍" />

            <div className="pt-8 mt-8 border-t border-gray-200">
              <SidebarLink href="/settings" label="Settings" icon="⚙️" />
              <SidebarLink href="/logout" label="Logout" icon="🚪" />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto flex flex-col">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
              <div className="flex items-center gap-4">
                <NotificationBell />
                <div className="text-sm text-gray-600">{session.user?.email}</div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}

function SidebarLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <span className="mr-3 text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
