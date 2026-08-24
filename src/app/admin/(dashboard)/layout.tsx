import Link from "next/link";
import { LayoutDashboard, Users, Settings, LogOut, Plus } from "lucide-react";

import Sidebar from "./components/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F9F7F2] text-[#4A4A45] font-sans selection:bg-[#D4C4B7]/30">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#F9F7F2] relative">
        <div className="p-10 max-w-7xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
