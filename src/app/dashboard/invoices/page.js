'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Plus, 
  FileText, 
  Loader2, 
  Calendar,
  DollarSign,
  Search,
  Filter,
  ChevronDown,
  Eye
} from "lucide-react";
import toast from "react-hot-toast";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch("/api/invoices");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setInvoices(data);
        setFilteredInvoices(data);
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  // Apply filters when search term or status filter changes
  useEffect(() => {
    let filtered = invoices;
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return '✅';
      case 'sent': return '📧';
      case 'overdue': return '⚠️';
      case 'draft': return '📝';
      default: return '📄';
    }
  };

  const handleRowClick = (invoiceId) => {
    router.push(`/dashboard/invoices/${invoiceId}`);
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  };

  const getStatusCount = (status) => {
    return invoices.filter(inv => inv.status === status).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Invoices</h1>
            <p className="mt-1 text-sm text-gray-600">Manage and track all your invoices</p>
          </div>
          <Link
            href="/dashboard/invoices/new"
            className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700 sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <div className="p-3 bg-white border-l-4 border-indigo-500 rounded-lg shadow-sm sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">Total Invoices</p>
          <p className="text-xl font-bold text-gray-900 sm:text-2xl">{invoices.length}</p>
        </div>
        <div className="p-3 bg-white border-l-4 border-green-500 rounded-lg shadow-sm sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">Total Amount</p>
          <p className="text-xl font-bold text-green-600 sm:text-2xl">${getTotalAmount().toFixed(2)}</p>
        </div>
        <div className="p-3 bg-white border-l-4 border-yellow-500 rounded-lg shadow-sm sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">Pending</p>
          <p className="text-xl font-bold text-yellow-600 sm:text-2xl">{getStatusCount('sent') + getStatusCount('draft')}</p>
        </div>
        <div className="p-3 bg-white border-l-4 border-red-500 rounded-lg shadow-sm sm:p-4">
          <p className="text-xs text-gray-500 sm:text-sm">Overdue</p>
          <p className="text-xl font-bold text-red-600 sm:text-2xl">{getStatusCount('overdue')}</p>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 mb-6 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search by invoice number, client name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pr-3 text-sm border border-gray-300 rounded-lg pl-9 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          {/* Filter Button (Mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg sm:hidden hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Status Filter */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block w-full sm:w-auto`}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer sm:w-auto focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
        
        {/* Active Filters */}
        {(searchTerm || statusFilter !== "all") && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="hover:text-red-500">×</button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 rounded-full">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter("all")} className="hover:text-red-500">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Invoices List */}
      {filteredInvoices.length > 0 ? (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden overflow-hidden bg-white rounded-lg shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Invoice #</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Client</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Due Date</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice._id} 
                      className="transition-colors cursor-pointer hover:bg-gray-50"
                      onClick={() => handleRowClick(invoice._id)}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-indigo-600">{invoice.invoiceNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{invoice.clientId?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(invoice.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">${invoice.total.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          <span>{getStatusIcon(invoice.status)}</span>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(invoice._id);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 transition-colors rounded cursor-pointer hover:bg-indigo-50"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View - Visible on mobile only */}
          <div className="space-y-3 md:hidden">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice._id}
                onClick={() => handleRowClick(invoice._id)}
                className="p-4 transition-shadow bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-indigo-600">{invoice.invoiceNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{invoice.clientId?.name || 'Unknown'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                    <span>{getStatusIcon(invoice.status)}</span>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                
                {/* Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-bold text-gray-900">${invoice.total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(invoice._id);
                    }}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Results Summary */}
          <div className="mt-4 text-sm text-center text-gray-500">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </>
      ) : (
        // Empty State
        <div className="p-8 text-center bg-white rounded-lg shadow-sm sm:p-12">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            {searchTerm || statusFilter !== "all" ? "No matching invoices" : "No invoices yet"}
          </h3>
          <p className="max-w-sm mx-auto mb-6 text-gray-500">
            {searchTerm || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "Create your first invoice to get started"}
          </p>
          {searchTerm || statusFilter !== "all" ? (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/dashboard/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Create Your First Invoice
            </Link>
          )}
        </div>
      )}
    </div>
  );
}