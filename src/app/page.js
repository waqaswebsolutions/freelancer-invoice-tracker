import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Invoice from "@/lib/models/Invoice";
import { DollarSign, Users, FileText, Clock, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

async function getDashboardData(userId) {
  await connectDB();
  
  const clients = await Client.find({ userId });
  const invoices = await Invoice.find({ userId }).populate('clientId');
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'draft').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  
  return {
    totalClients: clients.length,
    totalInvoices: invoices.length,
    totalRevenue,
    pendingInvoices,
    overdueInvoices,
    recentInvoices: invoices.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
  };
}

export default async function DashboardPage() {
  const user = await currentUser();
  const data = await getDashboardData(user?.id);

  const stats = [
    {
      name: "Total Revenue",
      value: `$${data.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "green",
      change: data.totalRevenue > 0 ? "+12.5%" : "0%",
    },
    {
      name: "Total Clients",
      value: data.totalClients,
      icon: Users,
      color: "blue",
      change: data.totalClients > 0 ? "+8%" : "0%",
    },
    {
      name: "Total Invoices",
      value: data.totalInvoices,
      icon: FileText,
      color: "purple",
      change: data.totalInvoices > 0 ? "+5%" : "0%",
    },
    {
      name: "Overdue",
      value: data.overdueInvoices,
      icon: Clock,
      color: "orange",
      change: data.overdueInvoices > 0 ? "+2%" : "0%",
    },
  ];

  return (
    <div className="px-3 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-5 sm:mb-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
              Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 sm:text-sm sm:mt-1">
              Welcome back! Here's your business overview.
            </p>
          </div>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all cursor-pointer w-full sm:w-auto"
          >
            <span>+</span>
            <span>Create Invoice</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="transition-all duration-200 bg-white shadow-sm rounded-xl hover:shadow-md"
          >
            <div className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg sm:p-2.5 bg-${stat.color}-100`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 text-${stat.color}-600`} />
                </div>
                <span className="text-xs font-medium text-green-600">{stat.change}</span>
              </div>
              <div className="mt-2 sm:mt-3">
                <p className="text-xs font-medium text-gray-500 sm:text-sm">
                  {stat.name}
                </p>
                <p className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats Row for Mobile */}
      <div className="grid grid-cols-3 gap-2 mb-6 sm:hidden">
        <div className="p-2 text-center bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="text-base font-bold text-yellow-600">{data.pendingInvoices}</p>
        </div>
        <div className="p-2 text-center bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Overdue</p>
          <p className="text-base font-bold text-red-600">{data.overdueInvoices}</p>
        </div>
        <div className="p-2 text-center bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-base font-bold text-green-600">
            {data.recentInvoices.filter(i => i.status === 'paid').length}
          </p>
        </div>
      </div>

      {/* Recent Invoices Section */}
      <div className="overflow-hidden bg-white shadow-sm rounded-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sm:px-6 sm:py-4">
          <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
            Recent Invoices
          </h2>
          <Link
            href="/dashboard/invoices"
            className="text-xs font-medium text-indigo-600 sm:text-sm hover:text-indigo-700"
          >
            View All →
          </Link>
        </div>
        
        {data.recentInvoices.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {data.recentInvoices.map((invoice) => (
              <Link
                key={invoice._id}
                href={`/dashboard/invoices/${invoice._id}`}
                className="block transition-colors hover:bg-gray-50"
              >
                <div className="px-4 py-3 sm:px-6 sm:py-4">
                  {/* Mobile Layout */}
                  <div className="flex flex-col gap-2 sm:hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-600">
                        {invoice.invoiceNumber}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.clientId?.name || 'Unknown'} • ${invoice.total.toFixed(2)} • Due {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Tablet and Desktop Layout */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center flex-1 gap-3">
                      <div className="w-28">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          {invoice.invoiceNumber}
                        </p>
                      </div>
                      <div className="flex-1 max-w-[200px]">
                        <p className="text-sm text-gray-900 truncate">
                          {invoice.clientId?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="w-24">
                        <p className="text-sm font-medium text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </p>
                      </div>
                      <div className="w-28">
                        <p className="text-xs text-gray-500">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {invoice.status}
                      </span>
                      <span className="text-sm text-indigo-600">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center sm:px-6 sm:py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-3 bg-gray-100 rounded-full sm:w-16 sm:h-16 sm:mb-4">
              <FileText className="w-6 h-6 text-gray-400 sm:w-8 sm:h-8" />
            </div>
            <h3 className="mb-1 text-sm font-medium text-gray-900 sm:text-base">
              No invoices yet
            </h3>
            <p className="mb-4 text-xs text-gray-500 sm:text-sm">
              Create your first invoice to start tracking your business.
            </p>
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <span>+</span>
              Create Invoice
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}