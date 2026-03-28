"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Please enter client name");
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error("Please enter client email");
      return;
    }
    
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      toast.success("Client created successfully!");
      
      // Log the response to verify ID is present
      console.log("Client created:", data);
      console.log("Client ID:", data._id);
      
      // Make sure we have an ID before redirecting
      if (data._id) {
        router.push(`/dashboard/clients/${data._id}`);
      } else {
        console.error("No ID returned from API", data);
        toast.error("Client created but redirect failed. Please check clients list.");
        router.push("/dashboard/clients");
      }
      
    } catch (error) {
      console.error("Error creating client:", error);
      toast.error(error.message || "Failed to create client. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
     <div className="max-w-3xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center mb-4 text-sm text-gray-500 cursor-pointer hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Clients
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Add New Client</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your client's information below
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6 bg-white rounded-lg shadow sm:p-6">
        {/* Basic Information */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div>
              <label htmlFor="company" className="block mb-1 text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                placeholder="Acme Inc."
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div>
          <h2 className="mb-4 text-lg font-medium text-gray-900">Address Information (Optional)</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="address.street" className="block mb-1 text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="address.street"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="address.city" className="block mb-1 text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  id="address.city"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                  placeholder="New York"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="address.state" className="block mb-1 text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  id="address.state"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                  placeholder="NY"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="address.zipCode" className="block mb-1 text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="address.zipCode"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                  placeholder="10001"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="address.country" className="block mb-1 text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  id="address.country"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-text"
                  placeholder="USA"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col gap-3 pt-4 border-t sm:flex-row">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Creating..." : "Save Client"}
          </button>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}