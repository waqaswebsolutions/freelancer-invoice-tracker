import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      <Sidebar />
      <div id="dashboard-main-content" className="transition-all duration-300 ease-in-out lg:ml-64" suppressHydrationWarning>
        <Header />
        <main className="py-4 sm:py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}