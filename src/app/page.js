import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container px-4 py-16 mx-auto sm:px-6 lg:px-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-20">
          <h1 className="text-2xl font-bold text-indigo-600">InvoiceTracker</h1>
          <Link
            href="/sign-in"
            className="px-6 py-2 text-white transition-colors bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Manage Your Freelance Business
          </h1>
          <p className="mb-10 text-xl text-gray-600">
            Create professional invoices, track payments, and manage clients all in one place.
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 text-lg font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>

        {/* Features */}
        <div className="grid gap-8 mt-24 md:grid-cols-3">
          <div className="p-6 text-center bg-white shadow-md rounded-xl">
            <div className="mb-3 text-4xl">📄</div>
            <h3 className="mb-2 text-xl font-semibold">Invoices</h3>
            <p className="text-gray-600">Create and send professional invoices in seconds</p>
          </div>
          <div className="p-6 text-center bg-white shadow-md rounded-xl">
            <div className="mb-3 text-4xl">👥</div>
            <h3 className="mb-2 text-xl font-semibold">Clients</h3>
            <p className="text-gray-600">Manage all your client information in one place</p>
          </div>
          <div className="p-6 text-center bg-white shadow-md rounded-xl">
            <div className="mb-3 text-4xl">💰</div>
            <h3 className="mb-2 text-xl font-semibold">Payments</h3>
            <p className="text-gray-600">Track payments and never miss a due date</p>
          </div>
        </div>
      </div>
    </div>
  );
}