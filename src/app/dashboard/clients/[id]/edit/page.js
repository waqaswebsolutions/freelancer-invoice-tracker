"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clientId, setClientId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  // Get client ID from URL
  useEffect(() => {
    const pathParts = pathname.split("/");
    const id = pathParts[pathParts.length - 2];
    console.log("ID from URL:", id);
    setClientId(id);
  }, [pathname]);

  // Fetch client data
  useEffect(() => {
    if (!clientId) return;

    const fetchClient = async () => {
      try {
        console.log("Fetching:", `/api/clients/${clientId}`);
        const response = await fetch(`/api/clients/${clientId}`);
        
        console.log("Response status:", response.status);
        
        if (response.status === 404) {
          toast.error("Client not found");
          router.push("/dashboard/clients");
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const client = await response.json();
        console.log("Client data:", client);
        
        setFormData({
          name: client.name || "",
          email: client.email || "",
          phone: client.phone || "",
          company: client.company || "",
          address: {
            street: client.address?.street || "",
            city: client.address?.city || "",
            state: client.address?.state || "",
            zipCode: client.address?.zipCode || "",
            country: client.address?.country || "",
          },
        });
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load client: " + error.message);
      } finally {
        setIsFetching(false);
      }
    };

    fetchClient();
  }, [clientId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Name and email required");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Update failed");
      }

      toast.success("Client updated!");
      router.push(`/dashboard/clients/${clientId}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this client? Cannot undo.")) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }
      
      toast.success("Client deleted");
      router.push("/dashboard/clients");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
  <div className="max-w-3xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href={`/dashboard/clients/${clientId}`}
          className="inline-flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Edit Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Address (Optional)</h3>
          <input
            type="text"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            placeholder="Street"
            className="w-full px-3 py-2 border rounded-md"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              placeholder="City"
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              placeholder="State"
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              placeholder="ZIP"
              className="px-3 py-2 border rounded-md"
            />
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleChange}
              placeholder="Country"
              className="px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-700 border border-red-300 rounded-md cursor-pointer hover:bg-red-50"
          >
            {isDeleting ? "Deleting..." : "Delete Client"}
          </button>
        </div>
      </form>
    </div>
  );
}