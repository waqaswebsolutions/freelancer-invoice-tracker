"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, LayoutDashboard, Users, FileText, Settings, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Invoices", href: "/dashboard/invoices", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function MobileSidebar({ open, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    onClose();
  };

  const handleNavigation = (href) => {
    router.push(href);
    onClose();
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/80" />
        </Transition.Child>

        <div className="fixed inset-0 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
              {/* Close button */}
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={onClose}
                  aria-label="Close sidebar"
                >
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              {/* Sidebar content */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-700 px-4 sm:px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <h1 className="text-xl font-bold text-white">InvoiceTracker</h1>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href;
                          return (
                            <li key={item.name}>
                              <button
                                onClick={() => handleNavigation(item.href)}
                                className={`w-full group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold cursor-pointer ${
                                  isActive
                                    ? "bg-indigo-800 text-white"
                                    : "text-indigo-200 hover:text-white hover:bg-indigo-600"
                                }`}
                              >
                                <item.icon
                                  className={`h-6 w-6 shrink-0 cursor-pointer ${
                                    isActive ? "text-white" : "text-indigo-200 group-hover:text-white"
                                  }`}
                                />
                                {item.name}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                    <li className="mt-auto">
                      <button
                        onClick={handleSignOut}
                        className="flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-indigo-200 hover:text-white hover:bg-indigo-600 cursor-pointer"
                      >
                        <LogOut className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white cursor-pointer" />
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}