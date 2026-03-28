import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import Client from "@/lib/models/Client";
import Link from "next/link";
import { Plus, Mail, Phone, Building2, MapPin, Users } from "lucide-react";

async function getClients(userId) {
  await connectDB();
  const clients = await Client.find({ userId }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(clients));
}

export default async function ClientsPage() {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }
  
  const clients = await getClients(user.id);

  return (
    <div className="px-4 py-4 sm:px-6 lg:px-8 sm:py-6 lg:py-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">Clients</h1>
            <p className="mt-1 text-sm text-gray-600">Manage your clients and their information</p>
          </div>
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700 sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Client
          </Link>
        </div>

        {clients.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <Link
                key={client._id}
                href={`/dashboard/clients/${client._id}`}
                className="block transition-all bg-white rounded-xl shadow hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <div className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                      <span className="text-lg font-semibold text-indigo-600">
                        {client.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      {client.company && (
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <Building2 className="w-3 h-3" />
                          {client.company}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {client.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (client.address.city || client.address.country) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate">
                          {[client.address.city, client.address.country].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 text-xs text-gray-400 border-t border-gray-100">
                    Added {new Date(client.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white shadow rounded-xl sm:p-12">
            <div className="mx-auto text-gray-400">
              <Users className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No clients yet</h3>
            <p className="max-w-sm mx-auto mt-2 text-gray-500">
              Get started by adding your first client. You'll be able to create invoices for them.
            </p>
            <Link
              href="/dashboard/clients/new"
              className="inline-flex items-center gap-2 px-4 py-2 mt-6 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Add Your First Client
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}