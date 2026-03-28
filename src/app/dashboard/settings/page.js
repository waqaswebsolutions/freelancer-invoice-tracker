"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  Bell,
  Palette,
  Database,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Download,
  Users,
  Receipt
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [exporting, setExporting] = useState(false);
  const [exportType, setExportType] = useState("all");

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) {
      fetchSettings();
    }
  }, [isLoaded, user]);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: prev[section] ? { ...prev[section], [field]: value } : value,
      [field]: value
    }));
  };

  const handleAddressChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      businessAddress: {
        ...prev?.businessAddress,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Export function
  const handleExport = async () => {
    setExporting(true);
    try {
      let apiUrl = "/api/export";
      if (exportType !== "all") {
        apiUrl += `?type=${exportType}`;
      }
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }
      
      const data = await response.json();
      
      // Create CSV content
      let csvContent = "";
      let filename = "";
      
      if (exportType === "clients" || exportType === "all") {
        const clientsData = exportType === "all" ? data.clients : data;
        if (clientsData && clientsData.length > 0) {
          csvContent += generateClientsCSV(clientsData);
          filename = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
        }
      }
      
      if (exportType === "invoices" || exportType === "all") {
        const invoicesData = exportType === "all" ? data.invoices : data;
        if (invoicesData && invoicesData.length > 0) {
          if (csvContent) csvContent += "\n\n";
          csvContent += generateInvoicesCSV(invoicesData);
          filename = exportType === "all" ? `full_export_${new Date().toISOString().split('T')[0]}.csv` : `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
        }
      }
      
      if (exportType === "clients" && data && data.length > 0) {
        csvContent = generateClientsCSV(data);
        filename = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (exportType === "invoices" && data && data.length > 0) {
        csvContent = generateInvoicesCSV(data);
        filename = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      if (!csvContent) {
        toast.error("No data to export");
        return;
      }
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const downloadLink = document.createElement("a");
      const blobUrl = URL.createObjectURL(blob);
      downloadLink.href = blobUrl;
      downloadLink.setAttribute("download", filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
      
      toast.success(`${exportType === "all" ? "All data" : exportType} exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(error.message || "Failed to export data");
    } finally {
      setExporting(false);
    }
  };
  
  const generateClientsCSV = (clients) => {
    const headers = [
      "Client ID",
      "Name",
      "Email",
      "Phone",
      "Company",
      "Street",
      "City",
      "State",
      "ZIP Code",
      "Country",
      "Created Date"
    ];
    
    const rows = clients.map(client => [
      client._id,
      client.name || "",
      client.email || "",
      client.phone || "",
      client.company || "",
      client.address?.street || "",
      client.address?.city || "",
      client.address?.state || "",
      client.address?.zipCode || "",
      client.address?.country || "",
      new Date(client.createdAt).toLocaleDateString()
    ]);
    
    return [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
  };
  
  const generateInvoicesCSV = (invoices) => {
    const headers = [
      "Invoice ID",
      "Invoice Number",
      "Client Name",
      "Client Email",
      "Date",
      "Due Date",
      "Subtotal",
      "Tax (%)",
      "Tax Amount",
      "Total",
      "Status",
      "Notes"
    ];
    
    const rows = invoices.map(invoice => [
      invoice._id,
      invoice.invoiceNumber || "",
      invoice.clientId?.name || "",
      invoice.clientId?.email || "",
      new Date(invoice.createdAt).toLocaleDateString(),
      new Date(invoice.dueDate).toLocaleDateString(),
      invoice.subtotal || 0,
      invoice.tax || 0,
      ((invoice.subtotal || 0) * (invoice.tax || 0) / 100).toFixed(2),
      invoice.total || 0,
      invoice.status || "",
      (invoice.notes || "").replace(/\n/g, " ")
    ]);
    
    return [
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: Building2 },
    { id: "data", name: "Data", icon: Database },
  ];

  if (loading || !isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <p className="text-gray-500">Failed to load settings</p>
      </div>
    );
  }

  return (
   <div className="max-w-5xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your account preferences and business settings
          </p>
        </div>
      
      </div>

      {/* Tabs */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <div className="overflow-x-auto border-b border-gray-200">
          <nav className="flex min-w-max sm:min-w-0" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 cursor-pointer whitespace-nowrap transition-colors
                    ${isActive
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b">
                {/* Profile Image */}
                <div className="relative">
                  <div className="flex items-center justify-center w-20 h-20 overflow-hidden rounded-full sm:w-24 sm:h-24 bg-gradient-to-r from-indigo-500 to-purple-500">
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "Profile"}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white sm:text-4xl">
                        {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0) || "?"}
                      </span>
                    )}
                  </div>
                  <button
                    className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700 cursor-pointer transition-colors"
                    title="Change photo (coming soon)"
                    disabled
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">Your photo is managed by Clerk</p>
                  <p className="mt-1 text-xs text-gray-400">Change photo in your Clerk dashboard</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    value={user?.firstName || ""}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">Managed by Clerk</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    value={user?.lastName || ""}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">Managed by Clerk</p>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={user?.emailAddresses[0]?.emailAddress || ""}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-400">Managed by Clerk</p>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === "data" && (
            <div className="space-y-6">
              <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Export Your Data</h3>
                </div>
                <p className="mb-4 text-sm text-blue-700">
                  Download all your clients and invoices data in CSV format. You can open this file in Excel, Google Sheets, or any spreadsheet application.
                </p>
                
                {/* Export Options */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setExportType("all")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        exportType === "all" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      All Data
                    </button>
                    <button
                      onClick={() => setExportType("clients")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                        exportType === "clients" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      Clients Only
                    </button>
                    <button
                      onClick={() => setExportType("invoices")}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
                        exportType === "invoices" 
                          ? "bg-blue-600 text-white" 
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <Receipt className="w-4 h-4" />
                      Invoices Only
                    </button>
                  </div>
                  
                  <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    {exporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {exporting ? "Exporting..." : `Export ${exportType === "all" ? "All Data" : exportType === "clients" ? "Clients" : "Invoices"} as CSV`}
                  </button>
                </div>
                
                <div className="pt-3 mt-4 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    CSV files can be opened in Microsoft Excel, Google Sheets, Apple Numbers, and other spreadsheet applications.
                  </p>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="mb-2 font-medium text-gray-900">What's included in the export?</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Clients:</strong> Name, email, phone, company, address, created date
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <strong>Invoices:</strong> Invoice number, client details, dates, amounts, tax, status, notes
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}