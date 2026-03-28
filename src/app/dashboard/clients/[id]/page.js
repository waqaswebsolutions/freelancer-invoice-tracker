
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Invoice from "@/lib/models/Invoice";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Edit, 
  FileText,
  Calendar,
  DollarSign,
  AlertCircle
} from "lucide-react";

async function getClientData(id, userId) {
  await connectDB();
  
  try {
    // Validate ObjectId format
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    if (!isValidObjectId) {
      console.log("Invalid ObjectId format:", id);
      return { client: null, invoices: null };
    }
    
    const client = await Client.findOne({ _id: id, userId });
    if (!client) {
      console.log("Client not found for ID:", id);
      return { client: null, invoices: null };
    }
    
    const invoices = await Invoice.find({ clientId: id, userId }).sort({ createdAt: -1 });
    
    return {
      client: JSON.parse(JSON.stringify(client)),
      invoices: JSON.parse(JSON.stringify(invoices)),
    };
  } catch (error) {
    console.error("Error fetching client data:", error);
    return { client: null, invoices: null };
  }
}

export default async function ClientDetailsPage({ params }) {
  // Await params before accessing its properties
  const { id } = await params;
  
  console.log("ClientDetailsPage rendering for ID:", id);
  
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }
  
  const { client, invoices } = await getClientData(id, user.id);
  
  if (!client) {
    notFound();
  }

  // Calculate financial stats
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const outstanding = totalInvoiced - totalPaid;

  const getStatusColor = (status) => {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <DollarSign className="w-3 h-3" />;
      case 'overdue': return <AlertCircle className="w-3 h-3" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-6xl px-4 py-6 mx-auto space-y-6 sm:px-6 lg:px-8">
      {/* Header with navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center text-sm text-gray-500 transition-colors cursor-pointer hover:text-gray-700 group w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Clients
        </Link>
        {/* FIXED: Edit link - uses client._id directly */}
        <Link
          href={`/dashboard/clients/${client._id}/edit`}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
        >
          <Edit className="w-4 h-4" />
          Edit Client
        </Link>
      </div>

      {/* Main Client Card */}
      <div className="overflow-hidden bg-white shadow-lg rounded-xl">
        {/* Header with gradient */}
        <div className="relative px-6 py-8 bg-gradient-to-r from-indigo-600 to-indigo-800 sm:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg">
                <span className="text-4xl font-bold text-indigo-600">
                  {client.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            </div>
            
            {/* Client Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{client.name}</h1>
              {client.company && (
                <p className="flex items-center justify-center gap-1 mt-1 text-indigo-100 sm:justify-start">
                  <Building2 className="w-4 h-4" />
                  {client.company}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-3 sm:justify-start">
                <span className="inline-flex items-center gap-1 text-sm text-indigo-100">
                  <Calendar className="w-4 h-4" />
                  Client since {new Date(client.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 border-b border-gray-100 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact Information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {client.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <a href={`mailto:${client.email}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                    {client.email}
                  </a>
                </div>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Phone className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <a href={`tel:${client.phone}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                    {client.phone}
                  </a>
                </div>
              </div>
            )}
            {client.address && (client.address.street || client.address.city) && (
              <div className="flex items-center gap-3 p-3 rounded-lg md:col-span-2 bg-gray-50">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Address</p>
                  <p className="text-sm font-medium text-gray-900">
                    {[
                      client.address.street,
                      client.address.city,
                      client.address.state,
                      client.address.zipCode,
                      client.address.country,
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Stats */}
        <div className="p-6 border-b border-gray-100 sm:p-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Financial Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100">
              <p className="text-sm text-gray-500">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100">
              <p className="text-sm text-green-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-700">${totalPaid.toFixed(2)}</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
              <p className="text-sm text-orange-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-700">${outstanding.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Invoices Section */}
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Invoices</h2>
            <Link
              href={`/dashboard/invoices/new?client=${client._id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
            >
              <FileText className="w-4 h-4" />
              Create New Invoice
            </Link>
          </div>

          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <Link
                  key={invoice._id}
                  href={`/dashboard/invoices/${invoice._id}`}
                  className="block transition-all border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:border-indigo-200"
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <span className="text-lg font-semibold text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.status)}`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-xl">
              <FileText className="w-16 h-16 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No invoices yet</h3>
              <p className="mt-2 text-gray-500">
                Create your first invoice for this client to get started.
              </p>
              <Link
                href={`/dashboard/invoices/new?client=${client._id}`}
                className="inline-flex items-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
              >
                <FileText className="w-4 h-4" />
                Create First Invoice
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}