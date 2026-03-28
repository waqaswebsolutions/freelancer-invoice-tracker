"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Loader2, Hash } from "lucide-react";
import toast from "react-hot-toast";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedClientId = searchParams.get("client");

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState(null);
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || "",
    dueDate: "",
    items: [{ description: "", quantity: 1, rate: 0, amount: 0 }],
    tax: 0,
    notes: "",
  });


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          // Set default due date based on settings
          if (data.defaultDueDays) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + data.defaultDueDays);
            setFormData(prev => ({ ...prev, dueDate: dueDate.toISOString().split('T')[0] }));
          }
          // Set default tax rate
          if (data.defaultTaxRate) {
            setFormData(prev => ({ ...prev, tax: data.defaultTaxRate }));
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch("/api/clients");
        if (response.ok) {
          const data = await response.json();
          setClients(data);
        }
      } catch (error) {
        console.error("Error fetching clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Fetch next invoice number
  useEffect(() => {
    const fetchNextInvoiceNumber = async () => {
      try {
        const response = await fetch("/api/invoices/generate-number");
        if (response.ok) {
          const data = await response.json();
          setNextInvoiceNumber(data.invoiceNumber);
        }
      } catch (error) {
        console.error("Error fetching invoice number:", error);
      }
    };
    fetchNextInvoiceNumber();
  }, []);

  // Calculate item amount
  const calculateItemAmount = (quantity, rate) => {
    return quantity * rate;
  };

  // Update item
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = calculateItemAmount(
        field === "quantity" ? parseFloat(value) : newItems[index].quantity,
        field === "rate" ? parseFloat(value) : newItems[index].rate
      );
    }

    setFormData({ ...formData, items: newItems });
  };

  // Add new item row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
    });
  };

  // Remove item row
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = parseFloat(formData.tax) || 0;
    return subtotal + (subtotal * tax / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Please select a client");
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].description) {
      toast.error("Please add at least one item");
      return;
    }

    if (!formData.dueDate) {
      toast.error("Please select a due date");
      return;
    }

    setIsSaving(true);

    const subtotal = calculateSubtotal();
    const total = calculateTotal();

    const invoiceData = {
      clientId: formData.clientId,
      dueDate: formData.dueDate,
      items: formData.items.map(item => ({
        description: item.description,
        quantity: Number(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount)
      })),
      subtotal: Number(subtotal),
      tax: Number(formData.tax) || 0,
      total: Number(total),
      notes: formData.notes,
    };

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invoice");
      }

      const data = await response.json();
      console.log("Invoice created:", data); // Debug log

      // Show success message with invoice number
      toast.success(`Invoice ${data.invoiceNumber} created successfully!`);

      // Redirect to invoice details page
      router.push(`/dashboard/invoices/${data._id}`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
   <div className="max-w-5xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/dashboard/invoices"
          className="inline-flex items-center text-gray-500 cursor-pointer hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Invoices
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Create New Invoice</h1>
      </div>

      {/* Invoice Number Preview */}
      {nextInvoiceNumber && (
        <div className="p-4 mb-6 border border-indigo-200 rounded-lg bg-indigo-50">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Next Invoice Number:</span>
            <span className="text-lg font-bold text-indigo-700">{nextInvoiceNumber}</span>
          </div>
          <p className="mt-1 text-xs text-indigo-500">Invoice numbers are automatically generated sequentially</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Selection */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="mb-4 text-lg font-semibold">Invoice Details</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Client *</label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md cursor-pointer"
                required
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client._id} value={client._id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Due Date *</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md cursor-text"
                required
              />
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Invoice Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 px-3 py-1 text-sm text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="flex flex-wrap items-end gap-2 pb-3 border-b">
                <div className="flex-1 min-w-[200px]">
                  <label className="block mb-1 text-xs font-medium">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="w-full px-2 py-1 text-sm border rounded-md cursor-text"
                    placeholder="Item description"
                  />
                </div>
                <div className="w-24">
                  <label className="block mb-1 text-xs font-medium">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border rounded-md cursor-text"
                    min="1"
                  />
                </div>
                <div className="w-28">
                  <label className="block mb-1 text-xs font-medium">Rate</label>
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(index, "rate", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm border rounded-md cursor-text"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-28">
                  <label className="block mb-1 text-xs font-medium">Amount</label>
                  <input
                    type="text"
                    value={`$${item.amount.toFixed(2)}`}
                    className="w-full px-2 py-1 text-sm border rounded-md cursor-default bg-gray-50"
                    readOnly
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-1 text-red-500 cursor-pointer hover:text-red-700"
                  disabled={formData.items.length === 1}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex justify-end">
            <div className="space-y-2 w-72">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tax (%):</span>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: parseFloat(e.target.value) || 0 })}
                  className="w-20 px-2 py-1 text-right border rounded-md cursor-text"
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="flex justify-between pt-2 font-bold border-t">
                <span>Total:</span>
                <span className="text-xl">${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="p-6 bg-white rounded-lg shadow">
          <label className="block mb-1 text-sm font-medium">Notes (Optional)</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows="3"
            className="w-full px-3 py-2 border rounded-md cursor-text"
            placeholder="Payment instructions, terms, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="inline w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="inline w-4 h-4 mr-2" />
                Create Invoice
              </>
            )}
          </button>
          <Link
            href="/dashboard/invoices"
            className="px-6 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}