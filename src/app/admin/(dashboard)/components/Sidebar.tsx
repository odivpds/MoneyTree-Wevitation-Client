"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, LayoutTemplate } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: "Invitations", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Templates", href: "/admin/templates", icon: LayoutTemplate },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#E6DFD1] rounded-lg text-[#4A4A45]"
      >
        <Menu size={24} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 border-r border-[#E6DFD1] bg-white p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#D4C4B7] flex items-center justify-center">
                <span className="font-serif italic text-white text-lg">M</span>
              </div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-[#333]">MoneyTree</h1>
            </div>
            <button className="md:hidden text-gray-400" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${isActive
                      ? "bg-[#F0EBE1] text-[#677359]"
                      : "text-gray-500 hover:bg-[#F9F7F2] hover:text-[#333]"
                    }`}
                >
                  <Icon size={20} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <Link
          href="/admin/signout"
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors w-full mt-auto"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </Link>
      </aside>
    </>
  );
}
