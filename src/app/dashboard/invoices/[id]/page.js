"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  FileText,
  Send,
  CheckCircle,
  AlertCircle,
  Printer,
  Loader2,
  Calendar,
  DollarSign,
  Copy,
  Check,
  CreditCard
} from "lucide-react";
import toast from "react-hot-toast";

export default function InvoiceDetailsPage({ params }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [invoiceId, setInvoiceId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Get invoice ID from params
  useEffect(() => {
    const getParams = async () => {
      try {
        const { id } = await params;
        console.log("Invoice ID from params:", id);
        setInvoiceId(id);
      } catch (error) {
        console.error("Error getting params:", error);
        toast.error("Invalid invoice ID");
        router.push("/dashboard/invoices");
      }
    };
    getParams();
  }, [params, router]);

  // Fetch invoice data
  useEffect(() => {
    if (!invoiceId) return;

    const fetchInvoice = async () => {
      try {
        console.log("Fetching invoice:", invoiceId);
        const response = await fetch(`/api/invoices/${invoiceId}`);
        
        console.log("Response status:", response.status);
        
        if (response.status === 404) {
          toast.error("Invoice not found");
          router.push("/dashboard/invoices");
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Invoice data received:", data);
        setInvoice(data);
        
        if (data.emailSent === true) {
          setEmailSent(true);
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Failed to load invoice");
        router.push("/dashboard/invoices");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, router]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) throw new Error("Failed to update status");
      
      const updated = await response.json();
      setInvoice(updated);
      return updated;
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    } finally {
      setUpdating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!invoice?.clientId?.email) {
      toast.error("Client has no email address. Please add an email to the client first.");
      return;
    }
    
    if (emailSent) {
      toast.info("Email already sent to this client");
      return;
    }
    
    setUpdating(true);
    try {
      const response = await fetch("/api/invoices/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoiceId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }
      
      toast.success(data.message || `Invoice sent to ${invoice.clientId.email}`);
      setEmailSent(true);
      
      const refreshedResponse = await fetch(`/api/invoices/${invoiceId}`);
      if (refreshedResponse.ok) {
        const updatedInvoice = await refreshedResponse.json();
        setInvoice(updatedInvoice);
      }
      
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const confirmMarkAsPaid = async () => {
    try {
      const updated = await updateStatus("paid");
      toast.success(`Invoice ${updated?.invoiceNumber} marked as paid! 💰`);
    } catch (error) {
      toast.error("Failed to mark invoice as paid");
    }
  };

  const handleMarkAsPaid = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
        <div className="flex-1 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 ml-3">
              <p className="text-sm font-medium text-gray-900">
                Mark Invoice as Paid?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                This invoice will be marked as paid and added to your total revenue.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              confirmMarkAsPaid();
            }}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-green-600 border border-transparent rounded-none rounded-r-lg cursor-pointer hover:text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Yes, Mark Paid
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex items-center justify-center w-full p-4 text-sm font-medium text-gray-600 border border-transparent rounded-none rounded-r-lg cursor-pointer hover:text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/dashboard/invoices/${invoiceId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Invoice link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Invoice not found</p>
        <Link href="/dashboard/invoices" className="inline-block mt-2 text-indigo-600 hover:underline">
          Back to Invoices
        </Link>
      </div>
    );
  }

  const invoiceNumber = invoice.invoiceNumber;

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'overdue': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="max-w-5xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center text-gray-500 cursor-pointer hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Invoices
        </Link>
        <div className="flex gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {invoice.status !== 'paid' && (
            <button
              onClick={handleMarkAsPaid}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-md cursor-pointer hover:bg-green-700 disabled:opacity-50"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              Mark as Paid
            </button>
          )}
          {invoice.status === 'draft' && !emailSent && (
            <button
              onClick={handleSendEmail}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 disabled:opacity-50"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Invoice
            </button>
          )}
        </div>
      </div>

      {/* Client Email Info */}
      {invoice.clientId?.email && invoice.status !== 'paid' && !emailSent && (
        <div className="flex items-center justify-between p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              Send invoice to: <strong>{invoice.clientId.email}</strong>
            </span>
          </div>
          <button
            onClick={handleSendEmail}
            disabled={updating}
            className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800"
          >
            Send Now →
          </button>
        </div>
      )}

      {/* Invoice Card */}
      <div className="overflow-hidden bg-white rounded-lg shadow-lg">
        {/* Header Section */}
        <div className="px-6 py-6 bg-gradient-to-r from-indigo-600 to-indigo-800 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">INVOICE</h1>
              <p className="mt-1 text-sm text-indigo-200 sm:text-base">{invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200">Status</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* From & To */}
          <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">From</h3>
              <div className="text-gray-800">
                <p className="font-semibold">Your Business</p>
                <p>Freelancer Invoice Tracker</p>
                <p>contact@yourbusiness.com</p>
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Bill To</h3>
              <div className="text-gray-800">
                <p className="text-lg font-semibold">{invoice.clientId?.name || "Unknown Client"}</p>
                {invoice.clientId?.company && <p>{invoice.clientId.company}</p>}
                {invoice.clientId?.email && (
                  <p className="flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3" />
                    {invoice.clientId.email}
                  </p>
                )}
                {invoice.clientId?.phone && (
                  <p className="flex items-center gap-1 mt-1">
                    <Phone className="w-3 h-3" />
                    {invoice.clientId.phone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4 p-4 mb-8 rounded-lg md:grid-cols-4 bg-gray-50">
            <div>
              <p className="text-xs text-gray-500 uppercase">Invoice Date</p>
              <p className="flex items-center gap-1 font-semibold">
                <Calendar className="w-3 h-3" />
                {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Due Date</p>
              <p className="flex items-center gap-1 font-semibold">
                <Calendar className="w-3 h-3" />
                {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Subtotal</p>
              <p className="font-semibold">${invoice.subtotal?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Tax ({invoice.tax || 0}%)</p>
              <p className="font-semibold">${((invoice.subtotal || 0) * (invoice.tax || 0) / 100).toFixed(2)}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-xs font-medium text-left text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Rate</th>
                    <th className="px-4 py-3 text-xs font-medium text-right text-gray-500 uppercase">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoice.items && invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600">${item.rate?.toFixed(2) || "0.00"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-right text-gray-800">${item.amount?.toFixed(2) || "0.00"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="flex justify-between py-2 border-t">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${invoice.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax ({invoice.tax || 0}%):</span>
                <span className="font-medium">${((invoice.subtotal || 0) * (invoice.tax || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold border-t border-b">
                <span>Total:</span>
                <span className="text-indigo-600">${invoice.total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 mt-8 rounded-lg bg-gray-50">
              <h4 className="mb-2 text-sm font-semibold text-gray-500 uppercase">Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 text-sm text-center text-gray-500 border-t bg-gray-50">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}