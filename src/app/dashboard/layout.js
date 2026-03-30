import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default async function DashboardLayout({ children }) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  console.log("DashboardLayout rendering with Sidebar"); // Add this

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64 transition-all duration-300 ease-in-out" id="dashboard-main-content">
        <Header />
        <main className="py-4 sm:py-6 lg:py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}